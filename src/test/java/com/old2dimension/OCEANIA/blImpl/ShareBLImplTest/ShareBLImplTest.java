package com.old2dimension.OCEANIA.blImpl.ShareBLImplTest;

import com.old2dimension.OCEANIA.blImpl.ShareBLImpl;
import com.old2dimension.OCEANIA.dao.CodeRepository;
import com.old2dimension.OCEANIA.dao.DomainLabelRepository;
import com.old2dimension.OCEANIA.dao.EdgeLabelRepository;
import com.old2dimension.OCEANIA.dao.VertexLabelRepository;
import com.old2dimension.OCEANIA.po.Code;
import com.old2dimension.OCEANIA.po.DomainLabel;
import com.old2dimension.OCEANIA.po.EdgeLabel;
import com.old2dimension.OCEANIA.po.VertexLabel;
import com.old2dimension.OCEANIA.vo.ResponseVO;
import com.old2dimension.OCEANIA.vo.UserAndCodeForm;
import org.junit.Assert;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.Mockito.*;

public class ShareBLImplTest {
    @Test
    public void TestAcceptSharedProject1() {
        ShareBLImpl shareBL = new ShareBLImpl();
        CodeRepository codeRepository = mock(CodeRepository.class);
        shareBL.setCodeRepository(codeRepository);

        UserAndCodeForm userAndCodeForm = new UserAndCodeForm(1, 1);
        when(codeRepository.findCodeById(1)).thenReturn(null);

        ResponseVO responseVO = shareBL.acceptSharedProject(userAndCodeForm);
        Assert.assertEquals(responseVO.getMessage(), "no such code");
    }

    @Test
    public void TestAcceptSharedProject2() {
        ShareBLImpl shareBL = new ShareBLImpl();
        CodeRepository codeRepository = mock(CodeRepository.class);
        shareBL.setCodeRepository(codeRepository);

        UserAndCodeForm userAndCodeForm = new UserAndCodeForm(1, 1);
        Code code = new Code(1, 1, "test", 10, 5, 1, 0);
        when(codeRepository.findCodeById(1)).thenReturn(code);

        ResponseVO responseVO = shareBL.acceptSharedProject(userAndCodeForm);
        Assert.assertEquals(responseVO.getMessage(), "you cannot share to yourself");
    }

    @Test
    public void TestAcceptSharedProject3() {
        ShareBLImpl shareBL = new ShareBLImpl();
        CodeRepository codeRepository = mock(CodeRepository.class);
        VertexLabelRepository vertexLabelRepository = mock(VertexLabelRepository.class);
        EdgeLabelRepository edgeLabelRepository = mock(EdgeLabelRepository.class);
        DomainLabelRepository domainLabelRepository = mock(DomainLabelRepository.class);
        shareBL.setCodeRepository(codeRepository);
        shareBL.setVertexLabelRepository(vertexLabelRepository);
        shareBL.setEdgeLabelRepository(edgeLabelRepository);
        shareBL.setDomainLabelRepository(domainLabelRepository);

        UserAndCodeForm userAndCodeForm = new UserAndCodeForm(1, 7);
        Code code = new Code(7, 2, "test", 10, 5, 1, 0);
        Code newCode = new Code(11, 1, "test", 10, 5, 1, 0);
        List<VertexLabel> oldVertexLabels = new ArrayList<VertexLabel>();
        List<VertexLabel> newVertexLabels = new ArrayList<VertexLabel>();
        VertexLabel v1 = new VertexLabel(2, 7, 5, "testTitle5", "testContent5");
        VertexLabel v2 = new VertexLabel(2, 7, 7, "testTitle7", "testContent7");
        VertexLabel v3 = new VertexLabel(1, 11, 5, "testTitle5", "testContent5");
        VertexLabel v4 = new VertexLabel(1, 11, 7, "testTitle7", "testContent7");
        oldVertexLabels.add(v1);
        oldVertexLabels.add(v2);
        newVertexLabels.add(v3);
        newVertexLabels.add(v4);
        List<EdgeLabel> oldEdgeLabels = new ArrayList<EdgeLabel>();
        List<DomainLabel> oldDomainLabels = new ArrayList<DomainLabel>();

        when(codeRepository.findCodeById(7)).thenReturn(code);
        when(codeRepository.save(any())).thenReturn(newCode);
        when(vertexLabelRepository.findVertexLabelsByCodeId(7)).thenReturn(oldVertexLabels);
        when(vertexLabelRepository.save(v3)).thenReturn(v3);
        when(vertexLabelRepository.save(v4)).thenReturn(v4);
        when(edgeLabelRepository.findEdgeLabelsByCodeId(7)).thenReturn(oldEdgeLabels);
        when(domainLabelRepository.findDomainLabelsByCodeId(7)).thenReturn(oldDomainLabels);

        ResponseVO responseVO = shareBL.acceptSharedProject(userAndCodeForm);
        Code c = (Code) responseVO.getContent();
        Assert.assertEquals(c.getId(), 11);
//        ResponseVO responseVO1 = shareBL.acceptSharedProject(userAndCodeForm);
//        List<VertexLabel> l = (ArrayList<VertexLabel>) responseVO1.getContent();
//        Assert.assertEquals(l.size(), 2);
//        Assert.assertEquals((l.get(0).getCodeId()), 11);
    }


}
