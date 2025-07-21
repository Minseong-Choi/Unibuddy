import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ProjectPage(){
    const { projectId } = useParams< {projectId: string} >();
    const [clips, setClips] = useState<any[]>([]);

    useEffect(() => {
        if(!projectId) return;
    }, [projectId]);

    return (
        <div style={{ padding: 20 }}>
            <h2>프로젝트 {projectId} 클립 관리</h2>
        </div>
    )
}