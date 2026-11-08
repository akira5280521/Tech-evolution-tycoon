package com.techevolutiontycoon.game;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AppUpdate")
public class AppUpdatePlugin extends Plugin {
    @PluginMethod
    public void installApk(PluginCall call) {
        String url = call.getString("url");
        if (!ApkUpdate.allowedUrl(url)) {
            call.reject("Update URL is not a release APK for this app.");
            return;
        }
        if (ApkUpdate.readyFor(getContext(), url)) {
            if (!ApkUpdate.canInstall(getContext())) {
                ApkUpdate.prefs(getContext()).edit().putBoolean("awaitingPermission", true).apply();
                ApkUpdate.openUnknownSourcesSettings(getContext());
                resolveStatus(call, "needs-permission");
                return;
            }
            ApkUpdate.launchInstaller(getContext());
            resolveStatus(call, "installing");
            return;
        }
        if (ApkUpdate.downloadInProgress(getContext())) {
            resolveStatus(call, "downloading");
            return;
        }
        if (!ApkUpdate.canInstall(getContext())) {
            ApkUpdate.prefs(getContext()).edit()
                .putString("pendingUrl", url)
                .putBoolean("awaitingPermission", true)
                .putBoolean("fileReady", false)
                .apply();
            ApkUpdate.openUnknownSourcesSettings(getContext());
            resolveStatus(call, "needs-permission");
            return;
        }
        try {
            ApkUpdate.enqueue(getContext(), url);
            resolveStatus(call, "downloading");
        } catch (Exception error) {
            call.reject("Couldn't start the download.");
        }
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        ApkUpdate.resumeAfterPermission(getContext());
    }

    private void resolveStatus(PluginCall call, String status) {
        JSObject result = new JSObject();
        result.put("status", status);
        call.resolve(result);
    }
}
