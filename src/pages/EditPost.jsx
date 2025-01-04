import React from "react";
import { useState } from "react";
import { apiService } from "@/services/api";

const EditPost = (post) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiService.updatePost(post.id, formData);
        } catch (err) {
            console.error("Error updating post:", err);
        }
    };
};

export default EditPost;
