package com.techevolutiontycoon.game;

import android.content.pm.PackageManager;
import android.os.Build;
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
        call.resolve(result);
    }
}
