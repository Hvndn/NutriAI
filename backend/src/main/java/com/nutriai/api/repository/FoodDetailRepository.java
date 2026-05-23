package com.nutriai.api.repository;

import com.nutriai.api.model.FoodDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodDetailRepository extends JpaRepository<FoodDetail, Long> {
}
