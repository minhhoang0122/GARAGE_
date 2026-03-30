package com.gara.modules.inventory.service;

import com.gara.entity.Supplier;
import com.gara.modules.inventory.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public List<Supplier> getActiveSuppliers() {
        return supplierRepository.findByActiveTrue();
    }

    public Supplier getSupplierById(Integer id) {
        return supplierRepository.findById(id).orElse(null);
    }

    @Transactional
    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    @Transactional
    public Supplier updateSupplier(Integer id, Supplier supplierDetails) {
        Supplier supplier = supplierRepository.findById(id).orElse(null);
        if (supplier != null) {
            supplier.setName(supplierDetails.getName());
            supplier.setSupplierCode(supplierDetails.getSupplierCode());
            supplier.setPhone(supplierDetails.getPhone());
            supplier.setEmail(supplierDetails.getEmail());
            supplier.setAddress(supplierDetails.getAddress());
            supplier.setTaxCode(supplierDetails.getTaxCode());
            supplier.setNotes(supplierDetails.getNotes());
            supplier.setActive(supplierDetails.getActive());
            return supplierRepository.save(supplier);
        }
        return null;
    }

    @Transactional
    public void deleteSupplier(Integer id) {
        supplierRepository.deleteById(id);
    }
}
