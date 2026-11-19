package com.techevolutiontycoon.game;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "InstallSource")
public class InstallSourcePlugin extends Plugin {
    @PluginMethod
    public void getInstaller(PluginCall call) {
        String installer = null;
        try {
            PackageManager manager = getContext().getPackageManager();
            String pkg = getContext().getPackageName();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                installer = manager.getInstallSourceInfo(pkg).getInstallingPackageName();
            } else {
                installer = manager.getInstallerPackageName(pkg);
            }
        } catch (Exception ignored) {
            installer = null;
        }
        JSObject result = new JSObject();
        result.put("installer", installer);
        // False in the Google Play build: no GitHub update checks or installs.
        result.put("sideloadUpdater", BuildConfig.SIDELOAD_UPDATER);
        call.resolve(result);
    }

    @PluginMethod
    public void openNotificationSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
            intent.putExtra(Settings.EXTRA_APP_PACKAGE, getContext().getPackageName());
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception error) {
            call.reject("Couldn't open notification settings", error);
        }
    }
}
