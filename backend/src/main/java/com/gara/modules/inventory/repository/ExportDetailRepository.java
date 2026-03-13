package com.gara.modules.inventory.repository;

import com.gara.entity.ExportDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExportDetailRepository extends JpaRepository<ExportDetail, Integer> {
    List<ExportDetail> findAllByHangHoaId(Integer productId);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM ExportDetail d WHERE d.phieuXuatKho.donHangSuaChua.id = :orderId")
    List<ExportDetail> findByOrderId(@org.springframework.data.repository.query.Param("orderId") Integer orderId);
}
