package com.evconnect.backend.service;

import com.evconnect.backend.entity.User;
import com.evconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public User register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(password)) {
                return user; // Simple password matching for demo
            }
        }
        throw new RuntimeException("Invalid credentials");
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = getUserById(userId);
        if (!user.getPassword().equals(oldPassword)) {
            throw new RuntimeException("Incorrect old password");
        }
        user.setPassword(newPassword);
        userRepository.save(user);
    }
}
