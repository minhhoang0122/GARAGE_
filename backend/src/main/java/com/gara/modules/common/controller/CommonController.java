package com.gara.modules.common.controller;

import com.gara.modules.common.service.CommonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/common")
public class CommonController {

    private final CommonService commonService;

    public CommonController(CommonService commonService) {
        this.commonService = commonService;
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String query) {
        return ResponseEntity.ok(commonService.globalSearch(query));
    }
}
