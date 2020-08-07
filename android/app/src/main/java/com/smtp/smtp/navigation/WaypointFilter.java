package com.smtp.smtp.navigation;

import android.location.Location;
import android.util.Log;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class WaypointFilter {
    public String TAG = "WaypointFilter";
    List<Waypoint> waypoints;
    Waypoint location;
    int distanceTolerance;
    List<Waypoint> remainingWaypoints;

    WaypointFilter(List<Waypoint> waypoints, Location location, int distanceTolerance, List<Waypoint> remainingWaypoints){
        this.waypoints = waypoints;
        Collections.sort(this.waypoints);
        this.location = new Waypoint(location.getLongitude(), location.getLatitude());
        this.distanceTolerance = distanceTolerance;
        this.remainingWaypoints = remainingWaypoints;
    }

    // Return the join with distance from current location condition
    private List<Waypoint> distanceFromLocationFilter() {
        List<Waypoint> result = new ArrayList<>();
        for ( Waypoint point:
             waypoints) {
            if(getDistanceBetween(point, location) < distanceTolerance){
                result.add(point);
            }
        }
        return result;
    }


    // Return the join with closer from arrival
    private List<Waypoint> distanceFromArrivalFilter() {
        List<Waypoint> result = new ArrayList<>();
        Waypoint arrival = waypoints.get(waypoints.size()-1);
        float distanceBetweenLocationAndArrival = getDistanceBetween(location, arrival);
        for ( Waypoint point:
                waypoints) {
            if(getDistanceBetween(point, arrival) < distanceBetweenLocationAndArrival){
                result.add(point);
            }
        }
        return result;
    }

    public List<Waypoint> cleanWaypoints(){
        List<Waypoint> A,B,C,D,union;

        C = remainingWaypoints;
        Log.d(TAG, "Remaining: ");
        for (Waypoint wp:
             remainingWaypoints) {
            Log.d(TAG, wp.toString());
        }

        D = distanceFromLocationFilter();
        Log.d(TAG, "Less than "+ distanceTolerance + "m of me: ");
        for (Waypoint wp:
            D ) {
            Log.d(TAG, wp.toString());
        }

        Log.d(TAG, "Remaining and "+ distanceTolerance + "m of me: ");
        A = intersection(C, D);
        for (Waypoint wp:
             A) {
            Log.d(TAG, wp.toString());
        }

        Log.d(TAG, "Ahead of me: ");
        B = distanceFromArrivalFilter();
        for (Waypoint wp:
                B) {
            Log.d(TAG, wp.toString());
        }

        Log.d(TAG, "Remaining and "+ distanceTolerance+"m of me OR Ahead of me: ");
        union = union(A,B);
        Collections.sort(union);
        for (Waypoint wp:
                union) {
            Log.d(TAG, wp.toString());
        }

        return union;
    }

    private float getDistanceBetween(Waypoint a, Waypoint b) {
        float[] distanceBetween = new float[3];
        Location.distanceBetween(
                a.latitude,
                a.longitude,
                b.latitude,
                b.longitude,
                distanceBetween
        );
        return distanceBetween[0];
    }

    public <T> List<T> union(List<T> list1, List<T> list2) {
        Set<T> set = new HashSet<T>();

        set.addAll(list1);
        set.addAll(list2);

        return new ArrayList<T>(set);
    }

    public <T> List<T> intersection(List<T> list1, List<T> list2) {
        List<T> list = new ArrayList<T>();

        for (T t : list1) {
            if(list2.contains(t)) {
                list.add(t);
            }
        }

        return list;
    }
}
