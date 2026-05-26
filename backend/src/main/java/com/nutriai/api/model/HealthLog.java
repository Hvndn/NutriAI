package com.nutriai.api.model;
 
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "weight")
    private Double weight;

    @Column(name = "water_ml")
    @Builder.Default
    private Integer waterMl = 0;

    @Column(name = "steps")
    @Builder.Default
    private Integer steps = 0;

    @Column(name = "sleep_hours")
    @Builder.Default
    private Double sleepHours = 0.0;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
