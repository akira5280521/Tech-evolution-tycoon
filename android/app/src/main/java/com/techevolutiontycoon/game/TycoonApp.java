package com.techevolutiontycoon.game;

import android.app.Application;
import android.app.DownloadManager;
import android.content.IntentFilter;
import android.os.Build;

/** Keeps the update-download receiver alive for as long as the process is. */
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
    }
}
