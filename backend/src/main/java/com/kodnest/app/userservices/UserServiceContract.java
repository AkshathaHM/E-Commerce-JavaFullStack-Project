package com.kodnest.app.userservices;

import com.kodnest.app.entities.RegisterRequest;
import com.kodnest.app.entities.User;

public interface UserServiceContract {
    public User registerUser(RegisterRequest request);
}