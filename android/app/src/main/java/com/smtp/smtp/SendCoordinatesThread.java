package com.smtp.smtp;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.pm.PackageManager;
import android.location.Location;
import android.util.Log;
import androidx.core.app.ActivityCompat;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.tasks.Task;

import org.json.JSONException;
import org.json.JSONObject;

import io.socket.client.Socket;

public class SendCoordinatesThread implements Runnable {
    private static final String TAG = "Navigation";
    private Socket mSocket;
    private String userId;
    private volatile boolean running = true;
    private volatile boolean paused = false;
    private final Object pauseLock = new Object();
    private FusedLocationProviderClient fusedLocationClient;
    private Location location;
    private JSONObject coordinates;

    SendCoordinatesThread() {
        /*this.mSocket = mSocket;
        this.userId = userId;*/
    }

    @Override
    @SuppressLint("MissingPermission")
    public void run() {
        while (running) {
            synchronized (pauseLock) {
                if (!running) {
                    break;
                }
                if (paused) {
                    try {
                        synchronized (pauseLock) {
                            pauseLock.wait();
                        }
                    } catch (InterruptedException ex) {
                        break;
                    }
                    if (!running) {
                        break;
                    }
                }
            }

            Log.d(TAG, "send coordinates :");

            // get location
            /*Task<Location> gettingLocation = this.fusedLocationClient.getLastLocation();
            while(!gettingLocation.isSuccessful()) {}
            location = gettingLocation.getResult();

            //save location in coordinates JSON Object
            coordinates = new JSONObject();
            try {
                coordinates.put("longitude", location.getLongitude());
                coordinates.put("latitude", location.getLatitude());
                sendCoordinates();
                Log.e(TAG, "send coordinates :" + location.getLatitude());
                Thread.sleep(10000);
            } catch (JSONException | InterruptedException e) {
                Log.e(TAG, e.getMessage());
            }

             */
        }
    }

    // stop thread
    public void stop() {
        running = false;
        reprendre();
    }

    // pause thread
    public void pause() {
        Log.d(TAG, "thread paused");
        paused = true;
    }

    // resume thread
    public void reprendre() {
        Log.d(TAG, "thread resume");
        synchronized (pauseLock) {
            paused = false;
            pauseLock.notifyAll();
        }
    }

    // to send coordinates
    private void sendCoordinates() {
        JSONObject obj = new JSONObject();
        try {
            obj.put("coordinates", coordinates);
            obj.put("etat", "pause");
            obj.put("ETA", 0);
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }
        this.mSocket.emit("chantier/sendCoordinates", obj);
    }
}
