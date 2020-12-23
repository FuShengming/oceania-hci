package com.old2dimension.OCEANIA.controller;

import com.old2dimension.OCEANIA.bl.ShareBL;
import com.old2dimension.OCEANIA.vo.ResponseVO;
import com.old2dimension.OCEANIA.vo.UserAndCodeForm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/share")
public class ShareController {
    @Autowired
    ShareBL shareBL;

    public void setShareBL(ShareBL shareBL) {
        this.shareBL = shareBL;
    }
    @RequestMapping(value = "/acceptSharedProject",method = RequestMethod.POST)
    public ResponseVO acceptSharedProject(@RequestBody UserAndCodeForm userAndCodeForm){
        return shareBL.acceptSharedProject(userAndCodeForm);
    }
}
