package com.old2dimension.OCEANIA.blImpl;

import com.old2dimension.OCEANIA.bl.ShareBL;
import com.old2dimension.OCEANIA.dao.*;
import com.old2dimension.OCEANIA.po.*;
import com.old2dimension.OCEANIA.vo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.io.File;
import java.nio.file.Files;

@Component
public class ShareBLImpl implements ShareBL {
    @Autowired
    CodeRepository codeRepository;
    @Autowired
    VertexLabelRepository vertexLabelRepository;
    @Autowired
    EdgeLabelRepository edgeLabelRepository;
    @Autowired
    DomainLabelRepository domainLabelRepository;

    @Autowired
    WorkPlaceRepository workPlaceRepository;

    public void setCodeRepository(CodeRepository codeRepository) {
        this.codeRepository = codeRepository;
    }

    public void setVertexLabelRepository(VertexLabelRepository vertexLabelRepository) {
        this.vertexLabelRepository = vertexLabelRepository;
    }

    public void setEdgeLabelRepository(EdgeLabelRepository edgeLabelRepository) {
        this.edgeLabelRepository = edgeLabelRepository;
    }

    public void setDomainLabelRepository(DomainLabelRepository domainLabelRepository) {
        this.domainLabelRepository = domainLabelRepository;
    }

    public ResponseVO acceptSharedProject(UserAndCodeForm userAndCodeForm) {
        try {
            int newUserId = userAndCodeForm.getUserId();
            int oldCodeId = userAndCodeForm.getCodeId();
            Code oldCode = codeRepository.findCodeById(oldCodeId);
            //没有找到对应代码
            if (oldCode == null) {
                return ResponseVO.buildFailure("no such code");
            }
            int oldUserId = oldCode.getUserId();
            //自己分享给自己的情况
            if (oldUserId == newUserId) {
                return ResponseVO.buildFailure("you cannot share to yourself");
            }
            Code newCode = new Code(newUserId, oldCode.getName(), oldCode.getNumOfVertices(), oldCode.getNumOfEdges(), oldCode.getNumOfDomains(), oldCode.getIs_default());
            Code res = codeRepository.save(newCode);
            int newCodeId = res.getId();
            //开始搬运注释
            List<VertexLabel> oldVertexLabels = vertexLabelRepository.findVertexLabelsByCodeId(oldCodeId);
//            List<VertexLabel> testVertexLabels = new ArrayList<>();
            if (oldVertexLabels.size() != 0) {
                for (VertexLabel v1 : oldVertexLabels) {
                    VertexLabel v2 = new VertexLabel(newUserId, newCodeId, v1.getVertexId(), v1.getTitle(), v1.getContent());
                    vertexLabelRepository.save(v2);
//                    testVertexLabels.add(v2);
                }
            }
            List<EdgeLabel> oldEdgeLabels = edgeLabelRepository.findEdgeLabelsByCodeId(oldCodeId);
            if (oldEdgeLabels.size() != 0) {
                for (EdgeLabel e1 : oldEdgeLabels) {
                    EdgeLabel e2 = new EdgeLabel(newUserId, e1.getEdgeId(), newCodeId, e1.getTitle(), e1.getContent());
                    edgeLabelRepository.save(e2);
                }
            }
            List<DomainLabel> oldDomainLabels = domainLabelRepository.findDomainLabelsByCodeId(oldCodeId);
            if (oldDomainLabels.size() != 0) {
                for (DomainLabel d1 : oldDomainLabels) {
                    DomainLabel d2 = new DomainLabel(newUserId, newCodeId, d1.getFirstEdgeId(), d1.getNumOfVertex(), d1.getTitle(), d1.getContent());
                    domainLabelRepository.save(d2);
                }
            }
            //
            //搬运workspace
            WorkSpace workSpace = workPlaceRepository.findLatestWorkSpace(oldCodeId);
            if(workSpace != null){
                WorkSpace newWorkSpace = new WorkSpace();
                newWorkSpace.setUserId(newUserId);
                newWorkSpace.setDate(workSpace.getDate());
                newWorkSpace.setCloseness(workSpace.getCloseness());
                newWorkSpace.setCodeId(newCodeId);
                newWorkSpace.setCyInfo(workSpace.getCyInfo());
                newWorkSpace = workPlaceRepository.save(newWorkSpace);
                if(newWorkSpace.getId()==0){
                    return ResponseVO.buildFailure("clone layout failed.");
                }
            }



            //复制文件
            File oldDependency = new File("src/main/resources/dependencies/" + oldCodeId + ".txt");
            File newDependency = new File("src/main/resources/dependencies/" + newCodeId + ".txt");
            File oldJar = new File("src/main/resources/jars/" + oldCodeId + ".jar");
            File newJar = new File("src/main/resources/jars/" + newCodeId + ".jar");

            File oldCodeFile = new File("src/main/resources/analyzeCode/src/"+ oldCodeId);
            File newCodeFile = new File("src/main/resources/analyzeCode/src/"+ newCodeId);

            Files.copy(oldDependency.toPath(), newDependency.toPath());
            Files.copy(oldJar.toPath(), newJar.toPath());
            folderCopy(oldCodeFile,newCodeFile);

//            return ResponseVO.buildSuccess(testVertexLabels);
            return ResponseVO.buildSuccess(res);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseVO.buildFailure("clone failed");
        }

    }

    private static void folderCopy(File srcFolder, File targetFolder) {
        try {
            //判断目标文件夹是否存在
            if (!targetFolder.exists()) {
                targetFolder.mkdir();
            }
            //获得源文件夹所有子文件
            File[] srcFiles = srcFolder.listFiles();
            assert srcFiles != null;
            for (File srcFile : srcFiles) {
                //创建复制目标文件
                File targetFile = new File(targetFolder.getAbsoluteFile() + "/" + srcFile.getName());
                if (!srcFile.isFile()) {
                    //源文件为文件夹，目标文件创建文件夹
                    targetFile.mkdir();
                    //递归
                    folderCopy(srcFile, targetFile);
                } else {
                    //不是文件夹，复制该文件(此处可以抽取为赋值文件方法)
                    FileInputStream fis = new FileInputStream(srcFile);
                    FileOutputStream fos = new FileOutputStream(targetFile);
                    byte[] bytes = new byte[1024 * 8];
                    int len = fis.read(bytes);
                    while (len != -1) {
                        fos.write(bytes, 0, len);
                        len = fis.read(bytes);
                    }
                    fis.close();
                    fos.close();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
