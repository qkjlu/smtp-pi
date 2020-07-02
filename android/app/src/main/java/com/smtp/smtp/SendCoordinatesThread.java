package com.smtp.smtp;

import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import io.socket.client.Socket;

public class SendCoordinatesThread  implements Runnable{
    private static final String TAG = "Navigation";
    private Socket mSocket;
    private String userId;
    private volatile boolean running = true;
    private volatile boolean paused = false;
    private final Object pauseLock = new Object();

    SendCoordinatesThread(Socket mSocket, String userId){
        this.mSocket = mSocket;
        this.userId = userId;
    }

    @Override
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

            Thread.sleep(10000);

        }
    }

    public void stop() {
        running = false;
        resume();
    }

    public void pause() {
        paused = true;
    }

    public void resume() {
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
