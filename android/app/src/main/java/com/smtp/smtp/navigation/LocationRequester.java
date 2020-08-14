package com.smtp.smtp.navigation;

import android.content.Context;
import android.location.Location;
import android.os.Looper;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;

import java.util.concurrent.Callable;

public class LocationRequester implements Callable<Location> {
    FusedLocationProviderClient fusedLocationClient;
    public LocationRequester(Context ctx) {
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(ctx);

        LocationRequest locationRequest = LocationRequest.create();
        // Location is requested every 0.5 seconds
        locationRequest.setInterval(500);
        locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);

        LocationCallback locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {
                if(locationResult == null){
                    return;
                }
                //onLocationRetrieved(locationResult.getLastLocation(), this);
            }
        };

        //fusedLocationClient.requestLocationUpdates(locationRequest,
                //locationCallback,
                //Looper.getMainLooper());
    }
    @Override
    public Location call() throws Exception {
        return null;
    }
}
