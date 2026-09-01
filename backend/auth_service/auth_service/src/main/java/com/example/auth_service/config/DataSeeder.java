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
        seedAdminUser("admin123", "System Admin", "admin@cuanflow.id", "admin123");
        seedAdminUser("admin", "Admin CuanFlow", "admin.cuanflow@email.com", "admin123");
    }

    private void seedAdminUser(String username, String name, String email, String rawPassword) {
        User user = userRepository.findByUsername(username).orElseGet(() -> {
            User u = new User();
            u.setUsername(username);
            return u;
        });

        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(UserRole.ADMIN);
        if (user.getPhone() == null) {
            user.setPhone("+6281234567890");
        }

        User savedUser = userRepository.save(user);

        if (!profileRepository.findByUserId(savedUser.getId()).isPresent()) {
            Profile profile = new Profile();
            profile.setUser(savedUser);
            profileRepository.save(profile);
        }

        System.out.println("Admin account '" + username + "' seeded/updated successfully!");
    }
}
