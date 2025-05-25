import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CategorySection.css";
import Constants from "../../../../Constants";
import menImage from "../../../../assets/img/nam.webp";
import womenImage from "../../../../assets/img/nu.webp";
import kidsImage from "../../../../assets/img/tre em.webp";

const imageMap = {
    1: menImage,
    2: womenImage,
    3: kidsImage
};

function CategorySection() {
    const [targetGroups, setTargetGroups] = useState([]);
    const navigate = useNavigate();

    useEffect(function () {
        axios.get(Constants.DOMAIN_API + "/target-group/list")
            .then(function (res) {
                setTargetGroups(res.data.data || []);
            })
            .catch(function (err) {
                console.error("Lỗi khi lấy target group:", err);
            });
    }, []);

    function handleClick(id) {
        navigate("/shop?target=" + id);
    }

    function renderTargetGroup(group) {
        return (
            <div
                key={group.id}
                className="categories-item"
                onClick={function () {
                    handleClick(group.id);
                }}
            >
                <div className="categories-card">
                    <img src={imageMap[group.id]} alt={group.label} />
                    <h3>{group.label.toUpperCase()}</h3>
                </div>
            </div>
        );
    }

    return (
        <section className="home-categories">
            <h2>Danh Mục Sản Phẩm</h2>
            <div className="categories-list">
                {targetGroups.map(renderTargetGroup)}
            </div>
        </section>
    );
}

export default CategorySection;
