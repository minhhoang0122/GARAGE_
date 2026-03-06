package com.gara.modules.inventory.repository;

import com.gara.entity.ExportDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExportDetailRepository extends JpaRepository<ExportDetail, Integer> {
    List<ExportDetail> findAllByHangHoaId(Integer productId);
}
