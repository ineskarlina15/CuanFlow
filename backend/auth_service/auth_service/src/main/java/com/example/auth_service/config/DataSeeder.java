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
@org.springframework.context.annotation.Profile("dev")
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminUsername = "admin";
        
        // Cek apakah admin sudah ada di database
        if (!userRepository.existsByUsername(adminUsername)) {
            User admin = new User();
            admin.setName("Admin CuanFlow");
            admin.setUsername(adminUsername);
            admin.setEmail("nesikarlina344@gmail.com");
            String adminPassword = System.getenv("DEFAULT_ADMIN_PASSWORD");
            if (adminPassword == null || adminPassword.isBlank()) {
                adminPassword = "password-admin";
            }
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(UserRole.ADMIN);
            admin.setPhone("+6281226790847");
            
            User savedAdmin = userRepository.save(admin);
            
            Profile adminProfile = new Profile();
            adminProfile.setUser(savedAdmin);
            profileRepository.save(adminProfile);
            
            System.out.println("Default Admin account created successfully!");
        }
    }
}
