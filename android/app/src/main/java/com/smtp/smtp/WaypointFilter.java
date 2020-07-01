package com.smtp.smtp;

import android.location.Location;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class WaypointFilter {
    List<Waypoint> waypoints;
    Waypoint location;
    int distanceTolerance;
    List<Waypoint> registeredWaypoints;

    WaypointFilter(List<Waypoint> waypoints, Location location, int distanceTolerance, List<Waypoint> registeredWaypoints){
        this.waypoints = waypoints;
        Collections.sort(this.waypoints);
        this.location = new Waypoint(location.getLongitude(), location.getLatitude());
        this.distanceTolerance = distanceTolerance;
        this.registeredWaypoints = registeredWaypoints;
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

    // Return the join with registered remaining point
    private List<Waypoint> remainingFilter() {
        List<Waypoint> result = new ArrayList<>();
        for ( Waypoint point:
                waypoints) {
            if(registeredWaypoints.contains(point)){
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

   // private List<Waypoint> cleanWaypoints(List<Waypoint> waypoints){

    //}

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
}
