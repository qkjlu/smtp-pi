package com.smtp.smtp;

import android.content.Intent;
import android.location.Location;
import android.os.Bundle;
import android.util.Log;
import android.widget.TextView;

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
    private String myEtat = "chargé";
    private double rayonChangementEtat = 40;

    private Socket mSocket;
    {
        try {
            mSocket = IO.socket("https://smtp-pi.herokuapp.com/");
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }
    private boolean connectedToChantier = false;

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

        Mapbox.getInstance(this, getString(R.string.mapbox_access_token));

        setContentView(R.layout.activity_main);
        navigationView = findViewById(R.id.navigationView);
        timeDiffTextView = findViewById(R.id.timeDiffTextView);

        timeDiffTextView.setText("Il n'y a pas de camions devant vous");
        navigationView.onCreate(savedInstanceState);
        navigationView.initialize(this);


        mSocket.on("chantier/user/sentCoordinates", onUserSentCoordinates);
        mSocket.on("chantier/connect/success", onConnectToChantierSuccess);

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

        if(connectedToChantier) { sendCoordinates(); }
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
        try {
            senderETA = data.getDouble("ETA");
            senderEtat = data.getString("etat");
            Log.d(TAG, "New coordinates received");
            modifyTimeDiffTruckAheadIfNecessary(senderETA, senderEtat);
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }
    });

    private Emitter.Listener onConnectToChantierSuccess = args -> {
        Log.d(TAG, "Connection to chantier successful");
        connectedToChantier = true;
        JSONObject data = (JSONObject) args[0];
        try {
            String previousEtatBeforeDisconnect = data.getString("etat");
            if(!previousEtatBeforeDisconnect.isEmpty()) {
                myEtat = previousEtatBeforeDisconnect;
                Log.d(TAG, "Etat changed to previous etat before disconnection : " + myEtat);
            }
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }
    };



}
