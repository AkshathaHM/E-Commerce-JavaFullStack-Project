package com.kodnest.app.adminServices;

import com.kodnest.app.entities.User;
import java.util.List;

public interface AdminUserServiceContract {

    public User modifyUser(Integer userId, String username, String email, String role, String otp);

    public void requestEmailChangeOtp(Integer userId, String newEmail);

    public User getUserById(Integer userId);

    public List<User> getAllUsers();
}
