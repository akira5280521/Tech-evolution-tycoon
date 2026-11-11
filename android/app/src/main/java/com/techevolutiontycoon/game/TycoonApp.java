package com.techevolutiontycoon.game;

import android.app.Application;
import android.app.DownloadManager;
import android.content.Context;
import android.content.IntentFilter;
import android.os.Build;
import com.google.android.gms.games.PlayGamesSdk;

/** Keeps the update-download receiver alive for as long as the process is, and starts Play Games. */
public class TycoonApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        IntentFilter filter = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
        if (Build.VERSION.SDK_INT >= 33) {
            registerReceiver(new UpdateDownloadReceiver(), filter, RECEIVER_EXPORTED);
        } else {
            registerReceiver(new UpdateDownloadReceiver(), filter);
        }
        ApkUpdate.catchUp(this);
        // Play Games starts only when this build has a project id, so builds
        // without one (tests, forks) never touch it.
        if (playGamesConfigured(this)) PlayGamesSdk.initialize(this);
    }

    /** True when res/values/strings.xml has a numeric Play Games project id. */
    static boolean playGamesConfigured(Context context) {
        String id = context.getString(R.string.game_services_project_id);
        return id != null && id.trim().matches("[0-9]{6,}");
    }
}
