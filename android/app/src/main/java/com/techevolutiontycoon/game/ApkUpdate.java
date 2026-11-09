package com.techevolutiontycoon.game;

import android.app.ActivityManager;
import android.app.DownloadManager;
import android.content.ClipData;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.content.pm.SigningInfo;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.widget.Toast;
import androidx.core.content.FileProvider;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.util.regex.Pattern;

/**
 * Downloads a GitHub release APK and hands it to the system package installer.
 *
 * Safety checks, in order:
 *  1. The link must be exactly this repo's release download, one tag and one .apk.
 *  2. The finished download is moved from shared storage into the app's private
 *     cache, so no other app can swap it before it is installed.
 *  3. The APK must be this app (same package name), newer than what is
 *     installed, and signed by the same key. Anything else is deleted.
 */
public final class ApkUpdate {
    static final String PREFS = "apk_update";
    static final String FILE_NAME = "techevolutiontycoon-update.apk";
    static final String STAGING_DIR = "updates";
    // GitHub repo paths are case-insensitive, and the API's download URL uses
    // the repo's canonical casing, which may not match how it is typed here.
    private static final Pattern ALLOWED_PATH = Pattern.compile(
        "^/akira5280521/tech-evolution-tycoon/releases/download/[A-Za-z0-9._-]+/[A-Za-z0-9._-]+\\.apk$",
        Pattern.CASE_INSENSITIVE
    );

    private ApkUpdate() {}

    static boolean allowedUrl(String url) {
        if (url == null || url.length() > 400) return false;
        // Escapes and dot segments can be decoded or normalized by a server into a
        // different repo's path, so the raw link must not contain any.
        if (url.indexOf('%') >= 0 || url.indexOf('\\') >= 0) return false;
        try {
            URI uri = new URI(url);
            if (!"https".equalsIgnoreCase(uri.getScheme())) return false;
            if (!"github.com".equalsIgnoreCase(uri.getHost())) return false;
            if (uri.getPort() != -1 || uri.getRawUserInfo() != null) return false;
            if (uri.getRawQuery() != null || uri.getRawFragment() != null) return false;
            String path = uri.getRawPath();
            if (path == null || path.contains("/./") || path.contains("/../")) return false;
            return ALLOWED_PATH.matcher(path).matches();
        } catch (Exception ignored) {
            return false;
        }
    }

    static File stagedApk(Context context) {
        return new File(new File(context.getCacheDir(), STAGING_DIR), FILE_NAME);
    }

    private static File downloadedApk(Context context) {
        File dir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        return dir == null ? null : new File(dir, FILE_NAME);
    }

    private static void copy(File from, File to) throws IOException {
        File parent = to.getParentFile();
        if (parent != null && !parent.exists() && !parent.mkdirs()) throw new IOException("no staging dir");
        try (InputStream in = new FileInputStream(from); OutputStream out = new FileOutputStream(to)) {
            byte[] buffer = new byte[64 * 1024];
            int n;
            while ((n = in.read(buffer)) > 0) out.write(buffer, 0, n);
        }
    }

    private static long versionOf(PackageInfo info) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) return info.getLongVersionCode();
        return info.versionCode;
    }

    @SuppressWarnings("deprecation")
    private static Signature[] signersOf(PackageInfo info) {
        if (info == null) return new Signature[0];
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P && info.signingInfo != null) {
            SigningInfo signing = info.signingInfo;
            Signature[] list = signing.hasMultipleSigners()
                ? signing.getApkContentsSigners()
                : signing.getSigningCertificateHistory();
            if (list != null && list.length > 0) return list;
        }
        return info.signatures != null ? info.signatures : new Signature[0];
    }

    @SuppressWarnings("deprecation")
    private static PackageInfo readArchive(PackageManager pm, String path) {
        PackageInfo info = null;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            info = pm.getPackageArchiveInfo(path, PackageManager.GET_SIGNING_CERTIFICATES);
        }
        if (info == null || signersOf(info).length == 0) {
            PackageInfo legacy = pm.getPackageArchiveInfo(path, PackageManager.GET_SIGNATURES);
            if (legacy != null) info = legacy;
        }
        return info;
    }

    @SuppressWarnings("deprecation")
    private static PackageInfo readInstalled(PackageManager pm, String pkg) throws PackageManager.NameNotFoundException {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            return pm.getPackageInfo(pkg, PackageManager.GET_SIGNING_CERTIFICATES);
        }
        return pm.getPackageInfo(pkg, PackageManager.GET_SIGNATURES);
    }

    /** Null when the APK is safe to install, otherwise a short reason. */
    static String verify(Context context, File apk) {
        if (apk == null || !apk.exists()) return "missing";
        PackageManager pm = context.getPackageManager();
        String pkg = context.getPackageName();
        PackageInfo archive = readArchive(pm, apk.getAbsolutePath());
        if (archive == null) return "not an app";
        if (!pkg.equals(archive.packageName)) return "a different app";
        PackageInfo installed;
        try {
            installed = readInstalled(pm, pkg);
        } catch (PackageManager.NameNotFoundException e) {
            return "can't read this app";
        }
        if (versionOf(archive) <= versionOf(installed)) return "not newer than this version";
        Signature[] theirs = signersOf(archive);
        Signature[] ours = signersOf(installed);
        for (Signature a : theirs) {
            for (Signature b : ours) {
                if (a.equals(b)) return null;
            }
        }
        return "signed with a different key";
    }

    static void notifyRejected(Context context, String reason) {
        final Context app = context.getApplicationContext();
        final String text = "Update not installed: the download was " + reason + ". Get it from the GitHub releases page instead.";
        new Handler(Looper.getMainLooper()).post(() -> Toast.makeText(app, text, Toast.LENGTH_LONG).show());
    }

    /** Move a finished download into private storage and check it. Null when it passed. */
    static String stageAndVerify(Context context) {
        File downloaded = downloadedApk(context);
        File staged = stagedApk(context);
        if (staged.exists()) staged.delete();
        if (downloaded == null || !downloaded.exists()) return "missing";
        try {
            copy(downloaded, staged);
        } catch (IOException e) {
            staged.delete();
            return "unreadable";
        } finally {
            downloaded.delete();
        }
        String problem = verify(context, staged);
        if (problem != null) staged.delete();
        return problem;
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
        return stagedApk(context).exists();
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
        String problem = stageAndVerify(context);
        if (problem != null) {
            prefs(context).edit()
                .putBoolean("fileReady", false)
                .putBoolean("installPending", false)
                .remove("downloadUrl")
                .apply();
            notifyRejected(context, problem);
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

    /** Opens the system installer for the staged APK. False if it failed the checks. */
    static boolean launchInstaller(Context context) {
        File file = stagedApk(context);
        // Check again right before installing, in case it was staged by an older build.
        String problem = verify(context, file);
        if (problem != null) {
            file.delete();
            prefs(context).edit()
                .putBoolean("fileReady", false)
                .putBoolean("installPending", false)
                .remove("downloadUrl")
                .apply();
            notifyRejected(context, problem);
            return false;
        }
        prefs(context).edit().putBoolean("installPending", false).apply();
        Uri uri = FileProvider.getUriForFile(context, context.getPackageName() + ".fileprovider", file);
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(uri, "application/vnd.android.package-archive");
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.setClipData(ClipData.newRawUri("update", uri));
        context.startActivity(intent);
        return true;
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
