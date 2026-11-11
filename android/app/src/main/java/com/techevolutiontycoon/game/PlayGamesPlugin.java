package com.techevolutiontycoon.game;

import android.app.Activity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.SnapshotsClient;
import com.google.android.gms.games.snapshot.Snapshot;
import com.google.android.gms.games.snapshot.SnapshotMetadata;
import com.google.android.gms.games.snapshot.SnapshotMetadataChange;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Google Play Games for the web game: sign-in state, the player's display
 * name, and one cloud save slot. The save itself is the same backup code the
 * Save Backup panel makes, so the game checks it exactly like a pasted code.
 *
 * Every method answers { configured: false } when this build has no Play
 * Games project id (see docs/play-games.md), so sideload and test builds
 * without it keep working.
 */
@CapacitorPlugin(name = "PlayGames")
public class PlayGamesPlugin extends Plugin {
    /** One cloud slot per Google account. */
    private static final String SLOT = "main";
    /** Backup codes are capped at 2,000,000 characters, inside Play's per-save limit. */
    private static final int MAX_CHARS = 2_000_000;

    private final ExecutorService io = Executors.newSingleThreadExecutor();

    private boolean configured() {
        return TycoonApp.playGamesConfigured(getContext());
    }

    private JSObject notConfigured() {
        JSObject out = new JSObject();
        out.put("configured", false);
        out.put("signedIn", false);
        return out;
    }

    private void fail(PluginCall call, String message, Exception e) {
        String detail = e != null && e.getMessage() != null ? e.getMessage() : "";
        call.reject(message, detail.isEmpty() ? null : detail);
    }

    /** Signed in or not, and the display name when signed in. Never shows UI. */
    @PluginMethod
    public void status(PluginCall call) {
        Activity activity = getActivity();
        if (!configured() || activity == null) {
            call.resolve(notConfigured());
            return;
        }
        PlayGames.getGamesSignInClient(activity).isAuthenticated()
            .addOnSuccessListener(result -> describe(call, activity, result.isAuthenticated()))
            .addOnFailureListener(e -> describe(call, activity, false));
    }

    /** Shows Google's sign-in screen if needed. */
    @PluginMethod
    public void signIn(PluginCall call) {
        Activity activity = getActivity();
        if (!configured() || activity == null) {
            call.resolve(notConfigured());
            return;
        }
        PlayGames.getGamesSignInClient(activity).signIn()
            .addOnSuccessListener(result -> describe(call, activity, result.isAuthenticated()))
            .addOnFailureListener(e -> fail(call, "Sign-in didn't finish.", e));
    }

    private void describe(PluginCall call, Activity activity, boolean signedIn) {
        JSObject out = new JSObject();
        out.put("configured", true);
        out.put("signedIn", signedIn);
        if (!signedIn) {
            call.resolve(out);
            return;
        }
        PlayGames.getPlayersClient(activity).getCurrentPlayer()
            .addOnSuccessListener(player -> {
                out.put("name", player != null ? player.getDisplayName() : null);
                call.resolve(out);
            })
            .addOnFailureListener(e -> call.resolve(out));
    }

    /** Writes { data, description, playedMs } to the cloud slot. */
    @PluginMethod
    public void saveCloud(PluginCall call) {
        Activity activity = getActivity();
        String data = call.getString("data");
        if (!configured() || activity == null) {
            call.resolve(notConfigured());
            return;
        }
        if (data == null || data.isEmpty() || data.length() > MAX_CHARS) {
            call.reject("That save is empty or too large.");
            return;
        }
        String description = call.getString("description", "Tech Evolution Tycoon save");
        Long playedMs = call.getLong("playedMs", 0L);
        SnapshotsClient snapshots = PlayGames.getSnapshotsClient(activity);
        snapshots.open(SLOT, true, SnapshotsClient.RESOLUTION_POLICY_MOST_RECENTLY_MODIFIED)
            .addOnSuccessListener(io, opened -> {
                if (opened.isConflict()) {
                    resolveThenRetry(call, snapshots, opened.getConflict());
                    return;
                }
                Snapshot snapshot = opened.getData();
                try {
                    byte[] bytes = data.getBytes(StandardCharsets.UTF_8);
                    snapshot.getSnapshotContents().writeBytes(bytes);
                    SnapshotMetadataChange.Builder change = new SnapshotMetadataChange.Builder()
                        .setDescription(description.length() > 100 ? description.substring(0, 100) : description);
                    if (playedMs != null && playedMs > 0) change.setPlayedTimeMillis(playedMs);
                    snapshots.commitAndClose(snapshot, change.build())
                        .addOnSuccessListener(meta -> {
                            JSObject out = new JSObject();
                            out.put("configured", true);
                            out.put("saved", true);
                            out.put("modified", meta.getLastModifiedTimestamp());
                            call.resolve(out);
                        })
                        .addOnFailureListener(e -> fail(call, "Couldn't save to Play Games.", e));
                } catch (Exception e) {
                    snapshots.discardAndClose(snapshot);
                    fail(call, "Couldn't save to Play Games.", e);
                }
            })
            .addOnFailureListener(e -> fail(call, "Couldn't open the Play Games save.", e));
    }

    /** Reads the cloud slot: { found, data, modified, description }. Never creates it. */
    @PluginMethod
    public void loadCloud(PluginCall call) {
        Activity activity = getActivity();
        if (!configured() || activity == null) {
            call.resolve(notConfigured());
            return;
        }
        SnapshotsClient snapshots = PlayGames.getSnapshotsClient(activity);
        snapshots.open(SLOT, false, SnapshotsClient.RESOLUTION_POLICY_MOST_RECENTLY_MODIFIED)
            .addOnSuccessListener(io, opened -> {
                if (opened.isConflict()) {
                    resolveThenRetry(call, snapshots, opened.getConflict());
                    return;
                }
                Snapshot snapshot = opened.getData();
                try {
                    byte[] bytes = snapshot.getSnapshotContents().readFully();
                    SnapshotMetadata meta = snapshot.getMetadata();
                    JSObject out = new JSObject();
                    out.put("configured", true);
                    out.put("found", bytes != null && bytes.length > 0);
                    out.put("data", bytes != null ? new String(bytes, StandardCharsets.UTF_8) : "");
                    out.put("modified", meta.getLastModifiedTimestamp());
                    out.put("description", meta.getDescription());
                    snapshots.discardAndClose(snapshot);
                    call.resolve(out);
                } catch (Exception e) {
                    snapshots.discardAndClose(snapshot);
                    fail(call, "Couldn't read the Play Games save.", e);
                }
            })
            .addOnFailureListener(e -> {
                // No save yet is the normal first-time case, not an error.
                JSObject out = new JSObject();
                out.put("configured", true);
                out.put("found", false);
                call.resolve(out);
            });
    }

    // With the "most recently modified" policy Play settles conflicts itself;
    // if one still comes back, keep the newer copy and ask the game to retry.
    private void resolveThenRetry(PluginCall call, SnapshotsClient snapshots, SnapshotsClient.SnapshotConflict conflict) {
        Snapshot a = conflict.getSnapshot();
        Snapshot b = conflict.getConflictingSnapshot();
        Snapshot keep = a.getMetadata().getLastModifiedTimestamp() >= b.getMetadata().getLastModifiedTimestamp() ? a : b;
        snapshots.resolveConflict(conflict.getConflictId(), keep)
            .addOnCompleteListener(done -> call.reject("The cloud save was busy. Try again.", "conflict"));
    }
}
