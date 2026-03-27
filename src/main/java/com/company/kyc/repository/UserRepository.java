package com.company.kyc.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.company.kyc.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    Optional<User> findByMobileno(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);

}