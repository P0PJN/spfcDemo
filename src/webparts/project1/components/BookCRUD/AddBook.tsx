import * as React from "react";
import { Form, Input, Button } from "antd";
import styles from "../Project1.module.scss";

interface IAddFormProps {
    onAdd: (newItem: any) => void;
    onCancel: () => void;
}

const AddForm: React.FC<IAddFormProps> = ({ onAdd, onCancel }) => {
    const [form] = Form.useForm();

    const handleFinish = (values: { title: string; description: string; price: string }) => {
        onAdd({
            Title: values.title,
            Description: values.description,
            Price: values.price,
        });
    };

    return (
        <Form
            form={form}
            layout="vertical"
            className={styles.addForm}
            onFinish={handleFinish}
        >
            <Form.Item
                label="Tên sách"
                name="title"
                rules={[{ required: true, message: "Missing a name" }]}
            >
                <Input placeholder="Nhập tên sách" />
            </Form.Item>

            <Form.Item
                label="Mô tả"
                name="description"
                rules={[{ required: true, message: "Describe some about this book" }]}
            >
                <Input placeholder="Nhập mô tả sách" />
            </Form.Item>

            <Form.Item
                label="Giá tiền"
                name="price"
                rules={[
                    { required: true, message: "Free book??" },
                ]}
            >
                <Input placeholder="Nhập giá tiền" type="number" />
            </Form.Item>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Button type="primary" htmlType="submit">
                    Thêm
                </Button>
                <Button htmlType="button" onClick={onCancel}>
                    Hủy
                </Button>
            </div>
        </Form>
    );
};

export default AddForm;
