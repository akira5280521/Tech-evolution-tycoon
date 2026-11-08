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
        final int requested;
        if ("portrait".equals(mode)) requested = ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT;
        else if ("landscape".equals(mode)) requested = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
        else requested = ActivityInfo.SCREEN_ORIENTATION_FULL_SENSOR;
        activity.runOnUiThread(() -> {
            activity.setRequestedOrientation(requested);
            call.resolve();
        });
    }
}
