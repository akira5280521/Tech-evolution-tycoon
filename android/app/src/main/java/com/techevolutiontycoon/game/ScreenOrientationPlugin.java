package com.techevolutiontycoon.game;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Locks or frees rotation without recreating the activity. */
@CapacitorPlugin(name = "ScreenOrientation")
public class ScreenOrientationPlugin extends Plugin {
    @PluginMethod
    public void lock(PluginCall call) {
        String mode = call.getString("orientation", "auto");
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("No activity");
            return;
        }
        // The USER_ modes follow the phone's auto-rotate switch: with it off,
        // the screen stays put. The SENSOR_ modes used before ignored it, so
        // the game rotated even for players who had turned auto-rotate off.
        final int requested;
        if ("portrait".equals(mode)) requested = ActivityInfo.SCREEN_ORIENTATION_USER_PORTRAIT;
        else if ("landscape".equals(mode)) requested = ActivityInfo.SCREEN_ORIENTATION_USER_LANDSCAPE;
        else requested = ActivityInfo.SCREEN_ORIENTATION_FULL_USER;
        activity.runOnUiThread(() -> {
            activity.setRequestedOrientation(requested);
            call.resolve();
        });
    }
}
