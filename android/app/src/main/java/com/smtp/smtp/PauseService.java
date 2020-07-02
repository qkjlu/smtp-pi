package com.smtp.smtp;

import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.location.Location;
import android.os.IBinder;
import android.util.Log;

import com.google.android.gms.location.FusedLocationProviderClient;

import org.json.JSONObject;

import io.socket.client.Socket;

public class PauseService extends Service {
    private static final String TAG = "Navigation";
    private Socket mSocket;
    private String userId;
    private FusedLocationProviderClient fusedLocationClient;
    private Location location;
    private JSONObject coordinates;
    SendCoordinatesThread pausedThread;
    PauseServiceBroadCast broadCast;
    Thread thread;

    public PauseService() {
    }

    // Broadcast to communicate with activity
    public class PauseServiceBroadCast extends BroadcastReceiver {

        @Override
        public void onReceive(Context context, Intent intent) {
            Log.d(TAG, "receiver :" + intent.getAction());

            if(intent.getAction().equals(getPackageName() +".START_PAUSE")){
                pausedThread.reprendre();
            }
            if(intent.getAction().equals(getPackageName() +".STOP_PAUSE")){
                pausedThread.pause();
            }
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate(){
        super.onCreate();
        pausedThread = new SendCoordinatesThread();
        thread =  new Thread(pausedThread,"pausedThreat");
        thread.start();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId){
        // create broadcast filter
        IntentFilter filter = new IntentFilter();
        filter.addAction(getPackageName() + ".PAUSE_NAVIGATION");
        filter.addAction(getPackageName() + ".STOP_NAVIGATION");
        broadCast = new PauseServiceBroadCast();
        registerReceiver(broadCast,filter);
        pausedThread.pause();
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        pausedThread.stop();
        unregisterReceiver(broadCast);
        super.onDestroy();
    }


}
