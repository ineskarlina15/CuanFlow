package com.example.auth_service.config;

import com.example.auth_service.entity.Profile;
import com.example.auth_service.entity.User;
import com.example.auth_service.entity.UserRole;
import com.example.auth_service.repository.ProfileRepository;
import com.example.auth_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUser("admin", "System Administrator", "admin@cuanflow.id", "admin123", UserRole.ADMIN);
        seedUser("galang", "Galang Pratama", "galang@gmail.com", "password123", UserRole.USER);
    }

    private void seedUser(String username, String name, String email, String rawPassword, UserRole role) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(email))
                .orElseGet(() -> {
                    User u = new User();
                    u.setUsername(username);
                    return u;
                });

        user.setName(name);
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setIsActive(true);
        if (user.getPhone() == null) {
            user.setPhone("081234567890");
        }

        User savedUser = userRepository.save(user);

        if (!profileRepository.findByUserId(savedUser.getId()).isPresent()) {
            Profile profile = new Profile();
            profile.setUser(savedUser);
            profileRepository.save(profile);
        }

        System.out.println("User account '" + username + "' seeded/updated successfully!");
    }
}
