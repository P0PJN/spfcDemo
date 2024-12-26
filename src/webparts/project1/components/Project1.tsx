import * as React from "react";

import { Button, Input, Modal, Table, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { IProject1Props } from "./IProject1Props";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import AddForm from "./BookCRUD/AddBook";
import EditForm from "./BookCRUD/UpdateBook";
import styles from "./Project1.module.scss";

class AsyncPager<T> {

  private iterator: AsyncIterator<T>;
  iterable: AsyncIterable<T>;

  constructor(iterable: AsyncIterable<T>, private pages: T[] = [], private pagePointer = -1, private isDone = false) {
    this.iterator = iterable[Symbol.asyncIterator]();
  }

  public get hasMorePages(): boolean {
    return !this.isDone;
  }

  public reset(iterable: AsyncIterable<T>): void {
    this.iterable = iterable;
    this.iterator = iterable[Symbol.asyncIterator]();
    this.pages = [];
    this.pagePointer = -1;
    this.isDone = false;
  }

  async current(): Promise<T> {
    if (this.pagePointer < 0) {
      return this.next();
    }
    return this.pages[this.pagePointer];
  }

  async next(): Promise<T> {
    let page = this.pages[++this.pagePointer];
    if (typeof page === "undefined") {
      if (this.isDone) {
        --this.pagePointer;
      } else {
        const next = await this.iterator.next();
        if (next.done) {
          this.isDone = true;
        } else {
          this.pages.push(next.value);
        }
      }
    }
    return this.pages[this.pagePointer];
  }

  async prev(): Promise<T> {
    if (this.pagePointer < 1) {
      return this.pages[0];
    }
    return this.pages[--this.pagePointer];
  }
}

interface IProject1State {
  listItems: any[];
  isAdd: boolean;
  isEdit: boolean;
  editItem: any | null;
  searchByName: string;
  pageNumber: number;
  pageSize: number;
  hasNextPage: boolean;
  pagedResult: any;
}

export default class Project1 extends React.Component<IProject1Props, IProject1State> {

  private pager: AsyncPager<any>;

  constructor(props: IProject1Props) {
    super(props);
    this.state = {
      listItems: [],
      isAdd: false,
      isEdit: false,
      editItem: null,
      searchByName: "",
      pageNumber: 1,
      pageSize: 5,
      hasNextPage: false,
      pagedResult: {}
    };
    this.pager = new AsyncPager(this.props.sp.web.lists.getByTitle("list_1").items.top(this.state.pageSize));
  }

  private async fetchListItems(): Promise<void> {
    try {
      const listItems = await this.pager.next();
      const hasNextPage = this.pager.hasMorePages;
      this.setState({ listItems, hasNextPage });
      console.log("items:", listItems)
    } catch (error) {
      console.error("Error fetching list items:", error);
    }
  }

  public componentDidMount(): void {
    this.fetchListItems();
  }

  private handleShowAddForm = (): void => {
    this.setState({ isAdd: true });
  };
  private handleAddItem = async (newItem: any): Promise<void> => {
    try {
      const addedItem = await this.props.sp.web.lists.getByTitle("list_1").items.add(newItem);
      this.setState((prevState) => ({
        listItems: [...prevState.listItems, addedItem.data],
        isAdd: false,
      }));
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  private handleCancelAdd = (): void => {
    this.setState({ isAdd: false });
  };

  private handleEdit = (item: any) => {
    this.setState({
      isEdit: true,
      editItem: item,
    });
  };

  private handleSaveEdit = async (updatedItem: any) => {
    try {
      const payload = {
        Title: updatedItem.Title,
        Description: updatedItem.Description,
        Price: updatedItem.Price,
      };
      await this.props.sp.web.lists.getByTitle("list_1").items.getById(updatedItem.Id).update(payload);
      const updatedList = this.state.listItems.map((item) =>
        item.Id === updatedItem.Id ? { ...item, ...payload } : item
      );
      this.setState({
        listItems: updatedList,
        isEdit: false,
        editItem: null,
      });
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  private handleCancelEdit = (): void => {
    this.setState({
      isEdit: false,
      editItem: null,
    });
  };

  private async deleteItem(id: number): Promise<void> {
    try {
      await this.props.sp.web.lists.getByTitle("list_1").items.getById(id).delete();
      alert("Item deleted successfully");
      this.fetchListItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  }

  private handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const keyword = event.target.value.toLowerCase();
    this.setState({ searchByName: keyword, pageNumber: 1 });

    try {
      if (keyword === "") {
        const iterable = this.props.sp.web.lists
          .getByTitle("list_1")
          .items.top(this.state.pageSize);

        this.pager.reset(iterable);

        const listItems = await this.pager.next();
        const hasNextPage = this.pager.hasMorePages;

        this.setState({ listItems, hasNextPage });
      } else {

        const iterable = this.props.sp.web.lists
          .getByTitle("list_1")
          .items.filter(`substringof('${keyword}', Title)`)
          .top(this.state.pageSize);

        this.pager.reset(iterable);

        const listItems = await this.pager.next();
        const hasNextPage = this.pager.hasMorePages;

        this.setState({ listItems, hasNextPage });
      }
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  private handleNextPage = async (): Promise<void> => {
    try {
      const nextPageItems = await this.pager.next();
      const hasNextPage = !this.pager.hasMorePages;
      if (nextPageItems.length > 0) {
        this.setState((prevState) => ({
          listItems: [...prevState.listItems, ...nextPageItems],
          pageNumber: prevState.pageNumber + 1,
          hasNextPage,
        }));
      }
      console.log(nextPageItems)
    }
    catch (error) {
      console.log("Error fetching page items:", error);
    }
  }

  private handlePrevPage = async (): Promise<void> => {
    try {
      const prevPageItems = await this.pager.prev();
      const hasNextPage = this.pager.hasMorePages;
      this.setState((prevState) => ({
        listItems: prevPageItems,
        pageNumber: Math.max(prevState.pageNumber - 1, 1),
        hasNextPage,
      }));
    }
    catch (error) {
      console.log("Error fetching page items:", error);
    }
  }

  public render(): React.ReactElement<IProject1Props> {

    const { isAdd, isEdit, editItem, listItems, searchByName, pageNumber, pageSize } = this.state;
    const filteredItems = listItems.filter((item) =>
      item.Title.toLowerCase().includes(searchByName)
    );
    const paginatedItems = filteredItems.slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize
    );

    const columns: ColumnsType<any> = [
      {
        title: "Tên sách",
        dataIndex: "Title",
        key: "Title",
        className: styles.textColor,
      },
      {
        title: "Mô tả",
        dataIndex: "Description",
        key: "Description",
        className: styles.textColor,
      },
      {
        title: "Giá tiền",
        dataIndex: "Price",
        key: "Price",
        className: styles.textColor,
      },
      {
        title: "Hành động",
        key: "action",
        className: styles.textColor,
        render: (_, record) => (
          <>
            <Button
              type="primary"
              className={styles.buttonColor}
              onClick={() => this.handleEdit(record)}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa mục này không?"
              onConfirm={() => this.deleteItem(record.Id)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button danger className={styles.buttonColor}>
                Xóa
              </Button>
            </Popconfirm>
          </>
        ),
      },
    ];

    return (

      <section className={styles.project1}>

        <div className={styles.booklist}>

          <h1 className={styles.title}>test sách</h1>

          <Input
            placeholder="Tìm kiếm sách"
            value={searchByName}
            onChange={this.handleSearchChange}
            className={styles.searchInput}
          />

          <Table
            dataSource={paginatedItems}
            columns={columns}
            rowKey="Id"
            pagination={false}
          />

          <button
            onClick={this.handlePrevPage}
            disabled={pageNumber === 1}
          >prev
          </button>

          <button
            onClick={this.handleNextPage}
            disabled={!this.state.hasNextPage}
          >
            next
          </button>

          <Button
            type="primary"
            className={styles.buttonColor}
            onClick={this.handleShowAddForm}
          >
            Thêm sách
          </Button>

        </div>
        <Modal
          title="Thêm sách"
          open={isAdd}
          onCancel={this.handleCancelAdd}
          footer={null}
        >

          <AddForm onAdd={this.handleAddItem} onCancel={this.handleCancelAdd} />
        </Modal>

        <Modal
          title="Sửa sách"
          open={isEdit}
          onCancel={this.handleCancelEdit}
          footer={null}
        >
          <EditForm
            item={editItem}
            onSave={this.handleSaveEdit}
            onCancel={this.handleCancelEdit}
          />
        </Modal>

      </section>
    );
  }
}
