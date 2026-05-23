package com.nutriai.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "scans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Scan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "food_name", nullable = false)
    private String foodName;

    private Double calories = 0.0;
    private Double carbs = 0.0;
    private Double protein = 0.0;
    private Double fat = 0.0;

    @Column(name = "weight_grams")
    private Double weightGrams = 100.0;

    @Column(name = "health_score")
    private Integer healthScore = 5;

    @Column(name = "health_advice", columnDefinition = "TEXT")
    private String healthAdvice;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "scan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FoodDetail> ingredients = new ArrayList<>();
}
