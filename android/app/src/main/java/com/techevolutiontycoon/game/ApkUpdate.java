package com.techevolutiontycoon.game;

import android.app.ActivityManager;
import android.app.DownloadManager;
import android.content.ClipData;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import java.io.File;
import java.util.Locale;

/** Downloads a GitHub release APK and hands it to the system package installer. */
public final class ApkUpdate {
    static final String PREFS = "apk_update";
    static final String FILE_NAME = "techevolutiontycoon-update.apk";
    private static final String ALLOWED_PREFIX =
        "https://github.com/akira5280521/tech-evolution-tycoon/releases/download/";

    private ApkUpdate() {}

    static boolean allowedUrl(String url) {
        // GitHub repo paths are case-insensitive, and the API's download URL uses
        // the repo's canonical casing, which may not match how it is typed here.
        return url != null && url.toLowerCase(Locale.ROOT).startsWith(ALLOWED_PREFIX);
    }

    static boolean canInstall(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return true;
        return context.getPackageManager().canRequestPackageInstalls();
    }

    static void openUnknownSourcesSettings(Context context) {
        Intent intent = new Intent(
            Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
            Uri.parse("package:" + context.getPackageName())
        );
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }

    /** Android blocks activity launches from the background (10+), silently. */
    static boolean inForeground() {
        ActivityManager.RunningAppProcessInfo info = new ActivityManager.RunningAppProcessInfo();
        ActivityManager.getMyMemoryState(info);
        return info.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND;
    }

    static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static boolean downloadInProgress(Context context) {
        long id = prefs(context).getLong("downloadId", -1);
        if (id < 0) return false;
        DownloadManager manager = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
        if (manager == null) return false;
        try (Cursor cursor = manager.query(new DownloadManager.Query().setFilterById(id))) {
            if (cursor == null || !cursor.moveToFirst()) return false;
            int status = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
            return status == DownloadManager.STATUS_PENDING
                || status == DownloadManager.STATUS_RUNNING
                || status == DownloadManager.STATUS_PAUSED;
        } catch (Exception ignored) {
            return false;
        }
    }

    static long enqueue(Context context, String url) {
        File dir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        if (dir != null && !dir.exists()) dir.mkdirs();
        File dest = new File(dir, FILE_NAME);
        if (dest.exists()) dest.delete();

        DownloadManager manager = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
        request.setMimeType("application/vnd.android.package-archive");
        request.setTitle("Tech Evolution Tycoon");
        request.setDescription("Downloading update");
        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE);
        request.setDestinationInExternalFilesDir(context, Environment.DIRECTORY_DOWNLOADS, FILE_NAME);
        request.addRequestHeader("User-Agent", "TechEvolutionTycoon");
        request.setAllowedOverMetered(true);
        request.setAllowedOverRoaming(true);
        long id = manager.enqueue(request);
        prefs(context).edit()
            .putLong("downloadId", id)
            .putString("downloadUrl", url)
            .putBoolean("fileReady", false)
            .apply();
        return id;
    }

    static boolean readyFor(Context context, String url) {
        if (!url.equals(prefs(context).getString("downloadUrl", null))) return false;
        if (!prefs(context).getBoolean("fileReady", false)) return false;
        File dir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        return dir != null && new File(dir, FILE_NAME).exists();
    }

    /** If a download finished while the process was gone, open the installer now. */
    static void catchUp(Context context) {
        long id = prefs(context).getLong("downloadId", -1);
        if (id < 0) return;
        if (prefs(context).getBoolean("fileReady", false)) return;
        onDownloadComplete(context, id);
    }

    static void onDownloadComplete(Context context, long id) {
        if (id != prefs(context).getLong("downloadId", -2)) return;
        DownloadManager manager = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
        if (manager == null) return;
        int status = DownloadManager.STATUS_FAILED;
        try (Cursor cursor = manager.query(new DownloadManager.Query().setFilterById(id))) {
            if (cursor != null && cursor.moveToFirst()) {
                status = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
            }
        } catch (Exception ignored) {
            status = DownloadManager.STATUS_FAILED;
        }
        if (status != DownloadManager.STATUS_SUCCESSFUL) {
            prefs(context).edit().putBoolean("fileReady", false).apply();
            return;
        }
        prefs(context).edit().putBoolean("fileReady", true).apply();
        if (!inForeground()) {
            // Finish when the player comes back; see resumeAfterPermission.
            prefs(context).edit().putBoolean("installPending", true).apply();
            return;
        }
        if (!canInstall(context)) {
            prefs(context).edit().putBoolean("awaitingPermission", true).apply();
            openUnknownSourcesSettings(context);
            return;
        }
        launchInstaller(context);
    }

    static void launchInstaller(Context context) {
        File dir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        if (dir == null) return;
        File file = new File(dir, FILE_NAME);
        if (!file.exists()) return;
        prefs(context).edit().putBoolean("installPending", false).apply();
        Uri uri = FileProvider.getUriForFile(context, context.getPackageName() + ".fileprovider", file);
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(uri, "application/vnd.android.package-archive");
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.setClipData(ClipData.newRawUri("update", uri));
        context.startActivity(intent);
    }

    static void resumeAfterPermission(Context context) {
        SharedPreferences prefs = prefs(context);
        if (prefs.getBoolean("installPending", false) && prefs.getBoolean("fileReady", false)) {
            if (canInstall(context)) {
                launchInstaller(context);
            } else {
                prefs.edit().putBoolean("installPending", false).putBoolean("awaitingPermission", true).apply();
                openUnknownSourcesSettings(context);
            }
            return;
        }
        if (!prefs.getBoolean("awaitingPermission", false) || !canInstall(context)) return;
        prefs.edit().putBoolean("awaitingPermission", false).apply();
        if (prefs.getBoolean("fileReady", false)) {
            launchInstaller(context);
            return;
        }
        String url = prefs.getString("pendingUrl", null);
        if (url == null) return;
        prefs.edit().remove("pendingUrl").apply();
        enqueue(context, url);
    }
}
