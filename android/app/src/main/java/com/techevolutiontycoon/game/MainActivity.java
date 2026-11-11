package com.techevolutiontycoon.game;

import android.content.res.Configuration;
import android.os.Bundle;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(InstallSourcePlugin.class);
        // The Google Play build has no self-updater (Play delivers updates).
        if (BuildConfig.SIDELOAD_UPDATER) registerPlugin(AppUpdatePlugin.class);
        registerPlugin(ScreenOrientationPlugin.class);
        registerPlugin(PlayGamesPlugin.class);
        super.onCreate(savedInstanceState);
        // Draw behind the status and gesture bars so CSS safe-area insets
        // pad the bottom nav instead of hiding it under the system UI.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        applyFontScale(getResources().getConfiguration());
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        applyFontScale(newConfig);
    }

    // Keep the WebView alive across rotation and system font changes, and
    // still honor a font scale up to the 1.3x range Android exposes.
    private void applyFontScale(Configuration config) {
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView == null || config == null || !(config.fontScale > 0)) return;
        int zoom = Math.round(config.fontScale * 100f);
        if (zoom < 50) zoom = 50;
        if (zoom > 200) zoom = 200;
        webView.getSettings().setTextZoom(zoom);
    }

    @Override
    public void onPause() {
        super.onPause();
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) webView.onPause();
    }

    @Override
    public void onResume() {
        super.onResume();
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) webView.onResume();
    }
}
