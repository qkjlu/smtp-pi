package com.smtp.smtp;

import android.content.Intent;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

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
import com.mapbox.services.android.navigation.v5.navigation.NavigationRoute;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class Navigation extends AppCompatActivity implements PermissionsListener, NavigationListener, OnNavigationReadyCallback {
    private NavigationView navigationView;
    private DirectionsRoute route;
    private PermissionsManager permissionsManager;
    private final boolean SHOULD_SIMULATE = false;

    private Point ORIGIN;
    private Point DESTINATION;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        /*if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            Window w = getWindow();
            w.setFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS, WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
        }*/

        Intent i = getIntent();
        double[] origin = i.getDoubleArrayExtra("origin");
        double[] destination = i.getDoubleArrayExtra("destination");

        //ORIGIN = Point.fromLngLat(3.866575956344605, 43.625855729888755);
        //DESTINATION = Point.fromLngLat(3.8642907142639165, 43.632382851071256);
        ORIGIN = Point.fromLngLat(origin[0], origin[1]);
        DESTINATION = Point.fromLngLat(destination[0], destination[1]);

        Mapbox.getInstance(this, getString(R.string.mapbox_access_token));

        setContentView(R.layout.activity_main);
        navigationView = findViewById(R.id.navigationView);
        navigationView.onCreate(savedInstanceState);
        navigationView.initialize(this);
    }

    @Override
    protected void onStart() {
        super.onStart();
        navigationView.onStart();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
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

    private void fetchRoute() {
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
                            //Snackbar.make(mapView, "Erreur au calcul de la route", Snackbar.LENGTH_LONG).show();
                        }

                    }

                    @Override
                    public void onFailure(Call<DirectionsResponse> call, Throwable throwable) {
                        //Snackbar.make(mapView, "Erreur au calcul de la route", Snackbar.LENGTH_LONG).show();
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
                .shouldSimulateRoute(true)
                .waynameChipEnabled(false)
                .shouldSimulateRoute(SHOULD_SIMULATE)
                .directionsRoute(route);
        /*NavigationLauncherOptions.Builder optionsBuilder = NavigationLauncherOptions.builder()
                .shouldSimulateRoute(true)
                .waynameChipEnabled(false)
                .shouldSimulateRoute(true)
                .directionsRoute(route);

        NavigationLauncher.startNavigation(this, optionsBuilder.build());*/

        navigationView.startNavigation(navViewBuilderOptions.build());
    }

    private boolean validRouteResponse(Response<DirectionsResponse> response) {
        return response.body() != null && !response.body().routes().isEmpty();
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
            fetchRoute();
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
            fetchRoute();
        }
    }
}
