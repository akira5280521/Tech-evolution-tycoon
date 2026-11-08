package com.techevolutiontycoon.game;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(InstallSourcePlugin.class);
        registerPlugin(AppUpdatePlugin.class);
        super.onCreate(savedInstanceState);
        // Draw behind the status and gesture bars so CSS safe-area insets
        // pad the bottom nav instead of hiding it under the system UI.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
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
