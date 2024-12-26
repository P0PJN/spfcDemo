import * as React from "react";
import { useEffect } from "react";
import { Form, Input, Button } from "antd";
import styles from "../Project1.module.scss";

interface IEditFormProps {
    item: {
        Id: number;
        Title: string;
        Description: string;
        Price: number;
    };
    onSave: (updatedItem: any) => void;
    onCancel: () => void;
}

const EditForm: React.FC<IEditFormProps> = ({ item, onSave, onCancel }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue(item);
    }, [item, form]);

    const handleFinish = (values: { Title: string; Description: string; Price: number }) => {
        onSave({ ...item, ...values });
    };

    return (
        <Form
            form={form}
            layout="vertical"
            className={styles.addForm}
            onFinish={handleFinish}
            initialValues={{
                Title: item.Title,
                Description: item.Description,
                Price: item.Price,
            }}
        >
            <Form.Item
                label="Tên Sách"
                name="Title"
                rules={[{ required: true, message: "Vui lòng nhập tên sách!" }]}
            >
                <Input placeholder="Nhập tên sách" />
            </Form.Item>

            <Form.Item
                label="Mô tả"
                name="Description"
                rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
            >
                <Input placeholder="Nhập mô tả sách" />
            </Form.Item>

            <Form.Item
                label="Giá tiền"
                name="Price"
                rules={[
                    { required: true, message: "Vui lòng nhập giá tiền!" },
                    { pattern: /^[0-9]+$/, message: "Giá tiền phải là số!" },
                ]}
            >
                <Input placeholder="Nhập giá tiền" type="number" />
            </Form.Item>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Button type="primary" htmlType="submit">
                    Lưu
                </Button>
                <Button htmlType="button" onClick={onCancel}>
                    Hủy
                </Button>
            </div>
        </Form>
    );
};

export default EditForm;
