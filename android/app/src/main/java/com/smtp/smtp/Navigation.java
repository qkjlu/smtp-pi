package com.smtp.smtp;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.location.Location;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.widget.TextView;

import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.snackbar.Snackbar;
import com.mapbox.android.core.permissions.PermissionsListener;
import com.mapbox.android.core.permissions.PermissionsManager;
import com.mapbox.api.directions.v5.models.DirectionsResponse;
import com.mapbox.api.directions.v5.models.DirectionsRoute;
import com.mapbox.geojson.Point;

import com.mapbox.mapboxsdk.Mapbox;
import com.mapbox.services.android.navigation.ui.v5.NavigationView;
import com.mapbox.services.android.navigation.ui.v5.NavigationViewOptions;
import com.mapbox.services.android.navigation.ui.v5.OnNavigationReadyCallback;
import com.mapbox.services.android.navigation.ui.v5.listeners.NavigationListener;
import com.mapbox.services.android.navigation.v5.navigation.MapboxNavigationOptions;
import com.mapbox.services.android.navigation.v5.navigation.NavigationRoute;
import com.mapbox.services.android.navigation.v5.offroute.OffRoute;
import com.mapbox.services.android.navigation.v5.routeprogress.ProgressChangeListener;
import com.mapbox.services.android.navigation.v5.routeprogress.RouteProgress;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class Navigation extends AppCompatActivity implements PermissionsListener, NavigationListener, OnNavigationReadyCallback, ProgressChangeListener {
    private NavigationView navigationView;
    private TextView timeDiffTextView;
    private DirectionsRoute route;
    private PermissionsManager permissionsManager;
    private final boolean SHOULD_SIMULATE = false;
    private static final String TAG = "Navigation";
    private OffRoute neverOffRouteEngine = new OffRoute() {
        @Override
        public boolean isUserOffRoute(Location location, RouteProgress routeProgress, MapboxNavigationOptions options) {
            // User will never be off-route
            return false;
        }
    };

    private Point ORIGIN;
    private Point DESTINATION;

    private String userId;
    private String chantierId;
    private JSONObject coordinates;
    private double remainingTime;
    private double timeDiffTruckAhead = Double.POSITIVE_INFINITY;
    private String myEtat;
    private double rayonChangementEtat = 100;

    private Socket mSocket;
    {
        try {
            // dev // mSocket = IO.socket("http://smtp-dev-env.eba-5jqrxjhz.eu-west-3.elasticbeanstalk.com/");
            mSocket = IO.socket(BuildConfig.API_URL);
            Log.d(TAG, "url : " + BuildConfig.API_URL);
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }
    private boolean connectedToChantier = false;

    public boolean isMyUserId(String userId){
        return userId.equals(this.userId);
    }

    public class User implements Comparable<User> {
        public String userId;
        public Double ETA;
        public String etat;

        public User(String userId, Double ETA, String etat){
            this.userId = userId;
            this.ETA = ETA;
            this.etat = etat;
        }

        public Double getETA() {
            return ETA;
        }

        public String getUserId() {
            return userId;
        }

        public String getEtat() {
            return etat;
        }

        @Override
        public int compareTo(User u) {
            return Double.compare(u.getETA(), this.getETA());
        }
    }

    private int myIndice;
    private ListUser myList = new ListUser();

public class ListUser{
    public ArrayList<User> list = new ArrayList<>();

    public boolean isAddable(User user){
        return user.getETA().equals(myEtat);
    }

    public int add(User user){
        if (isAddable(user)){
            list.add(user);
            Collections.sort(list);
            System.out.println("list trié"+list.toString());
            return 1;
        }
        else{
            return -1;
        }
    }

    public boolean isContainedUser(String userId){
        boolean res = false;
        for(int i=0; i < list.size(); i++){
            if(list.get(i).getUserId().equals(userId)){
                res = true;
            }
        }
        return res;
    }

    public void updateMyIndice(String userId){
        for(int i=0; i < list.size(); i++){
            if(isMyUserId(list.get(i).getUserId())){
                myIndice = i;
            }
        }
    }

    public boolean sameEtat(User user){
        return user.getEtat().equals(myEtat);
    }
    public void updateList(User user){
        if(!sameEtat(user)){
            myList.deleteUser(user.getUserId());
        }else{
            for(int i=0; i < list.size(); i++){
                if(list.get(i).equals(user.getUserId())){
                    list.get(i).ETA = user.getETA();
                }
            }
        }
        Collections.sort(list);
    }

    public void deleteUser(String userId){
        int res = -1;
        for(int i=0; i < list.size(); i++){
            if(list.get(i).getUserId().equals(userId)){
                res = i;
            }
        }
        list.remove(res);
        Collections.sort(list);
    }
}

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Intent i = getIntent();
        double[] origin = i.getDoubleArrayExtra("origin");
        double[] destination = i.getDoubleArrayExtra("destination");

        ORIGIN = Point.fromLngLat(origin[0], origin[1]);
        DESTINATION = Point.fromLngLat(destination[0], destination[1]);

        userId = i.getStringExtra("userId");
        chantierId = i.getStringExtra("chantierId");
        myEtat = i.getStringExtra("myEtat");
        myList.add(new User(userId,Double.POSITIVE_INFINITY,myEtat));

        Mapbox.getInstance(this, getString(R.string.mapbox_access_token));

        setContentView(R.layout.activity_main);
        navigationView = findViewById(R.id.navigationView);
        timeDiffTextView = findViewById(R.id.timeDiffTextView);

        timeDiffTextView.setText("Il n'y a pas de camions devant vous");
        navigationView.onCreate(savedInstanceState);
        navigationView.initialize(this);

        mSocket.on("chantier/user/sentCoordinates", onUserSentCoordinates);
        mSocket.on("chantier/connect/success", onConnectToChantierSuccess);
        mSocket.on("chantier/user/disconnected",onUserDisconnected);
        mSocket.connect();
        connectToChantier();

    }

    @Override
    protected void onStart() {
        super.onStart();
        navigationView.onStart();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        disconnectFromChantier();
        mSocket.disconnect();

        mSocket.off("chantier/user/sentCoordinates", onUserSentCoordinates);
        mSocket.off("chantier/connect/success", onConnectToChantierSuccess);
        mSocket.off("chantier/user/disconnected",onUserDisconnected);
        navigationView.onDestroy();

    }

    @Override
    protected void onResume() {
        super.onResume();
        navigationView.onResume();
    }

    @Override
    public void onLowMemory() {
        super.onLowMemory();
        navigationView.onLowMemory();
    }

    @Override
    protected void onStop() {
        super.onStop();
        navigationView.onStop();
    }

    @Override
    protected void onPause() {
        super.onPause();
        navigationView.onPause();
    }

    @Override
    public void onExplanationNeeded(List<String> permissionsToExplain) {

    }

    @Override
    public void onPermissionResult(boolean granted) {
        if (!granted) {
            this.finish();
            System.exit(0);
        } else {
            fetchRoute(ORIGIN, DESTINATION);
        }
    }

    @Override
    public void onCancelNavigation() {
        this.finish();
    }

    @Override
    public void onNavigationFinished() {

    }

    @Override
    public void onNavigationRunning() {

    }

    @Override
    public void onNavigationReady(boolean isRunning) {
        if (askLocationPermissionIfNeeded()) {
            if(myEtat.equals("chargé") || myEtat.equals("enChargement")) { fetchRoute(ORIGIN, DESTINATION); }
            if(myEtat.equals("déchargé") || myEtat.equals("enDéchargement")) { fetchRoute(DESTINATION, ORIGIN); }
        }
    }

    private float getDistanceFromDestination(Location location){
        float[] distanceFromDestination = new float[3];
        Point destination = null;
        if(myEtat.equals("chargé") || myEtat.equals("enDéchargement")) { destination = DESTINATION; }
        if(myEtat.equals("déchargé") || myEtat.equals("enChargement")) { destination = ORIGIN; }
        if(destination == null){ throw new Error("getDistanceFromDestination: destination cannot be null"); }
        Location.distanceBetween(
                location.getLatitude(),
                location.getLongitude(),
                destination.latitude(),
                destination.longitude(),
                distanceFromDestination
                );
        return distanceFromDestination[0];
    }
    @Override
    public void onProgressChange(Location location, RouteProgress routeProgress) {
        boolean didEtatChanged;
        float distanceFromDestination = getDistanceFromDestination(location);
        coordinates = new JSONObject();
        remainingTime = routeProgress.durationRemaining();
        didEtatChanged = changeMyEtatIfNecessary(distanceFromDestination);
        rerouteUserIfNecessary(didEtatChanged);

        Log.d(TAG, "Remaining time: " + remainingTime);
        Log.d(TAG, "Distance remaining: " + distanceFromDestination);
        try {
            coordinates.put("longitude", location.getLongitude());
            coordinates.put("latitude", location.getLatitude());
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }

        if(connectedToChantier) {
            sendCoordinates();
            myList.updateList(new User(userId,remainingTime,myEtat));
        }
    }

    private void fetchRoute(Point ORIGIN, Point DESTINATION) {
        NavigationRoute.Builder builder = NavigationRoute.builder(this)
                .accessToken("pk." + getString(R.string.gh_key))
                .baseUrl(getString(R.string.base_url))
                .user("gh")
                .origin(ORIGIN)
                .destination(DESTINATION)
                .profile("car");

        NavigationRoute navRoute = builder.build();

        navRoute.getRoute(
                new Callback<DirectionsResponse>() {
                    @Override
                    public void onResponse(Call<DirectionsResponse> call, Response<DirectionsResponse> response) {
                        if (validRouteResponse(response)) {
                            route = response.body().routes().get(0);
                            launchNavigation();
                        } else {
                            Snackbar.make(navigationView, "Erreur au calcul de la route", Snackbar.LENGTH_LONG).show();
                        }
                    }
                    @Override
                    public void onFailure(Call<DirectionsResponse> call, Throwable throwable) {
                        Snackbar.make(navigationView, "Erreur au calcul de la route", Snackbar.LENGTH_LONG).show();
                    }
                });
    }

    private boolean askLocationPermissionIfNeeded() {
        if (!PermissionsManager.areLocationPermissionsGranted(this)) {
            permissionsManager = new PermissionsManager(this);
            permissionsManager.requestLocationPermissions(this);
            return PermissionsManager.areLocationPermissionsGranted(this);
        } else {
            return true;
        }
    }

    private void launchNavigation() {
        NavigationViewOptions.Builder navViewBuilderOptions = NavigationViewOptions.builder()
                .navigationListener(this)
                .progressChangeListener(this)
                .shouldSimulateRoute(true)
                .waynameChipEnabled(false)
                .shouldSimulateRoute(SHOULD_SIMULATE)
                .directionsRoute(route);

        navigationView.startNavigation(navViewBuilderOptions.build());
    }

    private boolean validRouteResponse(Response<DirectionsResponse> response) {
        return response.body() != null && !response.body().routes().isEmpty();
    }

    private boolean changeMyEtatIfNecessary(double distanceRemaining) {
        boolean etatChanged = false;
        String previousEtat = myEtat;
        if(distanceRemaining < rayonChangementEtat) {
            if(myEtat.equals("chargé")) {
                myEtat = "enDéchargement";
                etatChanged = true;
            } else if (myEtat.equals("déchargé")){
                myEtat = "enChargement";
                etatChanged = true;
            }
        } else {
            if(myEtat.equals("enChargement")){
                myEtat = "chargé";
                etatChanged = true;
            } else if (myEtat.equals("enDéchargement")){
                myEtat = "déchargé";
                etatChanged = true;
            }
        }
        if(etatChanged) { Log.d(TAG,"Etat changed: from " + previousEtat + " to " + myEtat); }
        return etatChanged;
    }

    private boolean rerouteUserIfNecessary(boolean etatChanged){
        boolean userRerouted = false;
        if(etatChanged){
            if(myEtat.equals("chargé")) {
                fetchRoute(ORIGIN, DESTINATION);
                userRerouted = true;
            } else if( myEtat.equals("déchargé")) {
                fetchRoute(DESTINATION, ORIGIN);
                userRerouted = true;
            }
        }
        if (userRerouted) { Log.d(TAG, "User rerouted"); }
        return userRerouted;
    }

    private void modifyTimeDiffTruckAheadIfNecessary(double senderETA, String senderEtat){
        if(senderIsClosestTruckAhead(senderETA, senderEtat)) {
            timeDiffTruckAhead = remainingTime - senderETA;
            long timeDiffInMinutes = Math.round(timeDiffTruckAhead/60);
            if(timeDiffInMinutes <= 1) {
                timeDiffTextView.setText(timeDiffInMinutes + " minute d'écart avec le camion de devant");
            } else {
                timeDiffTextView.setText(timeDiffInMinutes + " minutes d'écarts avec le camion de devant");
            }
            Log.d(TAG, "Time diff with truck ahead modified: " + timeDiffTruckAhead);
        } else if(timeDiffTruckAhead == Double.POSITIVE_INFINITY) {
            timeDiffTextView.setText("Il n'y a pas de camions devant vous");
        }
    }

    private void modifyTimeDiffTruckAheadIfNecessary2(double senderETA, String senderEtat){
        if(myIndice > 0 && myList.list.size() > 1){
            User userAhed = myList.list.get(myIndice-1);
            timeDiffTruckAhead = remainingTime - userAhed.getETA();
            double minutes =  Math.round(timeDiffTruckAhead / 60);
            double secondes = Math.round(timeDiffTruckAhead - minutes * 60);
            if(minutes <= 1) {
                timeDiffTextView.setText(secondes +" secondes d'écart avec le camion de devant");
            } else {
                timeDiffTextView.setText(minutes + " mn "+ secondes +" d'écarts avec le camion de devant");
            }
            Log.d(TAG, "Time diff with truck ahead modified: " + timeDiffTruckAhead);
        }else{
            timeDiffTextView.setText("Il n'y a pas de camions devant vous");
        }
    }

    // Si l'envoyeur :
    // - a le même état que moi,
    // - une différence positive entre mon ETA et le sien,
    // - une différence d'ETA inférieure à la différence d'ETA courante
    // ===> Alors c'est le camion devant moi le plus proche
    private boolean senderIsClosestTruckAhead(double senderETA, String senderEtat) {
        double timeDiffWithSender = remainingTime - senderETA;
        Log.d(TAG, "Checking if sender is closest truck ahead");
        Log.d(TAG, "My ETA: " + remainingTime);
        Log.d(TAG, "My etat: " + myEtat);
        Log.d(TAG, "Sender ETA: " + senderETA);
        Log.d(TAG, "Sender etat: " + senderEtat);
        if (senderEtat.equals(myEtat) && timeDiffWithSender > 0 && timeDiffWithSender < timeDiffTruckAhead) {
            return true;
        }
        return false;
    }

    private void sendCoordinates() {
        JSONObject obj = new JSONObject();
        try {
            obj.put("coordinates", coordinates);
            obj.put("etat", myEtat);
            obj.put("ETA", remainingTime);

        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }
        Log.d(TAG, "Sending coordinates");
        mSocket.emit("chantier/sendCoordinates", obj);
    }

    private void disconnectFromChantier() {
        Log.d(TAG, "Disconnecting from chantier");
        connectedToChantier = false;
        mSocket.emit("chantier/disconnect");
    }
    private void connectToChantier() {
        JSONObject obj = new JSONObject();
        try {
            obj.put("userId", userId);
            obj.put("chantierId", chantierId);
            obj.put("coordinates", coordinates);
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }
        Log.d(TAG,"Connecting to chantier");
        mSocket.emit("chantier/connect", obj);
    }

    private Emitter.Listener onUserSentCoordinates = args -> runOnUiThread(() -> {
        JSONObject data = (JSONObject) args[0];
        double senderETA;
        String senderEtat;
        String senderId;
        try {
            senderETA = data.getDouble("ETA");
            senderEtat = data.getString("etat");
            senderId = data.getString("userId");
            Log.d(TAG, "New coordinates received");
            User sender = new User(senderId,senderETA,senderEtat);
            if (myList.isContainedUser(senderId)){
                myList.updateList(sender);
            }else{
                myList.add(sender);
            }
            myList.updateMyIndice(this.userId);
            // TODO supprimer les utilisateurs qui n'ont pas le meme etat
            modifyTimeDiffTruckAheadIfNecessary(senderETA, senderEtat);
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }
    });

    private Emitter.Listener onConnectToChantierSuccess = args -> {
        Log.d(TAG, "Connection to chantier successful");
        connectedToChantier = true;
        Log.d(TAG, "Etat after connection : " + myEtat);
        // JSONObject data = (JSONObject) args[0];
        // try {
        //     String previousEtatBeforeDisconnect = data.getString("etat");
        //     if(!previousEtatBeforeDisconnect.isEmpty()) {
        //         myEtat = previousEtatBeforeDisconnect;
        //         Log.d(TAG, "Etat changed to previous etat before disconnection : " + myEtat);
        //     }
        // } catch (JSONException e) {
        //     Log.e(TAG, e.getMessage());
        //     return;
        // }
    };

    private Emitter.Listener onUserDisconnected = args -> {
        JSONObject data = (JSONObject) args[0];
        timeDiffTextView.setText("Recherche de camions..("+myEtat+")");
        String senderId;
        try {
            senderId = data.getString("userId");
            if(myList.isContainedUser(senderId)){
                myList.deleteUser(senderId);
            }else{
                Log.d(TAG, " impossible to delete : user not in the list ");
            }

        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }
    };
}
