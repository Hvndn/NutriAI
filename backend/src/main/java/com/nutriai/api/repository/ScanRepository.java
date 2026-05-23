package com.nutriai.api.repository;

import com.nutriai.api.model.Scan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScanRepository extends JpaRepository<Scan, Long> {
    List<Scan> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Scan> findByUserIdAndFoodNameContainingIgnoreCaseOrderByCreatedAtDesc(Long userId, String foodName);
    
    List<Scan> findByUserIdAndCreatedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);
    
    Optional<Scan> findByIdAndUserId(Long id, Long userId);
}
