package com.smtp.smtp.navigation;

import androidx.annotation.Nullable;

public class User implements Comparable {
    public String userId;
    public Double ETA;
    public String etat;

    public User(String userId, Double ETA, String etat) {
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
    public int compareTo(Object o) {
        User u = (User)o;
        if (u.getUserId().equals(userId)) return 0;
        return -1;
    }

    @Override
    public boolean equals(@Nullable Object obj) {
        return compareTo(obj) == 0;
    }

    public void setETA(Double eta) {
        this.ETA = eta;
    }

    public void setState(String state) {
        etat = state;
    }
}
