import React, { Component } from 'react';
import { createStore } from 'redux'
import { List, Typography, Skeleton, Tag } from 'antd';
import { Modal, Button, Popconfirm, message } from 'antd';
import { Input, Form, Icon, Checkbox, } from 'antd';
import './App.css';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

function reducer(state = {
  visible: false,
}, action) {
  if (typeof state === "undefined") {
    return 0;
  }
  switch (action.type) {
    case 'SHOW':
      return {
        ...state,
        visible: true,
      }
    case 'HIDE':
      return{
        ...state,
        visible: false,
      }
    default:
      return console.log("default success");
  }
}

var store = createStore(reducer);

var modalActionCreator = function (isShow) {
  return {
    type: isShow?'SHOW':'HIDE',
  }
}




const Search = Input.Search;

class NormalLoginForm extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        console.log('Received values of form: ', values.userName);
        console.log('Received values of form: ', values.password);
        let formData = new FormData();
        formData.append('username', values.userName);
        formData.append('password', values.password);

        fetch(`https://www.yhddx.cn/fe_demo/login/`, {
          method: 'POST',
          mode: 'cors',
          credentials: 'include',
          body: formData,
        }).then(function (response) {
          return response.json();
        })
          .then(
            result => {
              if (result.status === 0) {
                message.success("登录成功");
                this.props.hideLogin();
              }
              console.log("登录成功")
            }

          );
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <Form.Item>
          {getFieldDecorator('userName', {
            rules: [{ required: true, message: 'Please input your username!' }],
          })(
            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('remember', {
            valuePropName: 'checked',
            initialValue: true,
          })(
            <Checkbox>Remember me</Checkbox>
          )}
          <a className="login-form-forgot" href="">Forgot password</a>
          <Button type="primary" htmlType="submit" className="login-form-button">
            Log in
          </Button>
          Or <a href="">register now!</a>
        </Form.Item>
      </Form>
    );
  }
}

const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(NormalLoginForm);


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mydata: [
      ],
      inputValue: "",
      inputIndex: undefined,
      visible: false,
      loginVisible: false,
      modifyList: false,
      addList: false,
      editorState: EditorState.createEmpty(),
      searchValue: "",
      userName: "",
    };
    store.subscribe(()=>{
      this.setState({
        visible:store.getState().visible,
      });
    });
    this.showAddModal = this.showAddModal.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.catchData = this.catchData.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.cancel = this.cancel.bind(this);
    this.onEditorStateChange = this.onEditorStateChange.bind(this);
    this.userLogin = this.userLogin.bind(this);
    this.loginHandleCancel = this.loginHandleCancel.bind(this);
    this.loginHandleOk = this.loginHandleOk.bind(this);
    this.hideLogin = this.hideLogin.bind(this);
  };

  hideLogin() {
    this.setState({
      loginVisible: false,
    })
  }

  userLogin() {
    this.setState({
      loginVisible: true,
    })
  }
  onSearch(value) {
    this.state.searchValue = value;

    this.setState({
      searchValue: this.state.searchValue,
    })
    this.getData();
  }
  confirm(idx, e) {
    let formData = new FormData();
    formData.append('id', this.state.mydata[idx].id);

    fetch(`https://www.yhddx.cn/fe_demo/delete/`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      body: formData,
    }).then(function (response) {
      return response.json();
    })
      .then(result => {
        if (result.status === 0) {
          message.success("删除成功");
          this.state.mydata.splice(idx, 1);
          this.setState({
            mydata: this.state.mydata
          })
        }
      });
  }
  editList(idx, e) {
    console.log(htmlToDraft(this.state.mydata[idx].content));
    const contentBlock = htmlToDraft(this.state.mydata[idx].content);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      const editorState = EditorState.createWithContent(contentState);
      this.setState({
        // visible: true,
        modifyList: true,
        inputValue: this.state.mydata[idx].title,
        editorState: editorState,
        inputIndex: idx,
      });
      store.dispatch(modalActionCreator(true))
    }

  }

  cancel(e) {
    message.error('Click on No');
  }

  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  showAddModal() {

    this.setState({
      // visible: true,
      addList: true,
      inputValue: "",
      editorState: EditorState.createEmpty(),
    })
    store.dispatch(modalActionCreator(true))
  }
  loginHandleCancel() {
    this.setState({
      loginVisible: false,
    })
  }
  handleCancel() {
    // this.setState({ visible: false })
    store.dispatch(modalActionCreator(false))
  }
  catchData(e) {
    this.setState({
      inputValue: e.target.value,
    });
  }
  loginHandleOk() {
    this.setState({
      loginVisible: false,
    });
  }
  handleOk() {
    console.log(this.state.addList, this.state.modifyList);
    if (this.state.addList) {
      let formData = new FormData();
      formData.append('title', this.state.inputValue);
      formData.append('content', draftToHtml(convertToRaw(this.state.editorState.getCurrentContent())));

      fetch(`https://www.yhddx.cn/fe_demo/add/`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        body: formData,
      }).then(function (response) {
        return response.json();
      })
        .then(result => {
          if (result.status === 0) {
            message.success("提交成功");
            this.state.mydata.push({ id: result.id, title: this.state.inputValue, content: draftToHtml(convertToRaw(this.state.editorState.getCurrentContent())) });

            this.setState({
              mydata: this.state.mydata,

              // visible: false,
              addList: false,
            });
            store.dispatch(modalActionCreator(false));
          }
        });
    }
    if (this.state.modifyList) {
      let formData = new FormData();
      formData.append('title', this.state.inputValue);
      formData.append('content', draftToHtml(convertToRaw(this.state.editorState.getCurrentContent())));
      formData.append('id', this.state.mydata[this.state.inputIndex].id);

      fetch(`https://www.yhddx.cn/fe_demo/edit/`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        body: formData,
      }).then(function (response) {
        return response.json();
      })
        .then(result => {
          if (result.status === 0) {
            message.success("修改成功");
            this.state.mydata[this.state.inputIndex].title = this.state.inputValue;
            this.state.mydata[this.state.inputIndex].content = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));

            this.setState({
              // visible: false,
              modifyList: false,
              mydata: this.state.mydata,
            });
            store.dispatch(modalActionCreator(false));
          }
        })
        .catch(function (error) {
          console.log(error);
        });

    }
  }
  getData() {
    console.log(`https://www.yhddx.cn/fe_demo/?q=` + this.state.searchValue);
    fetch(`https://www.yhddx.cn/fe_demo/?q=` + this.state.searchValue, { credentials: 'include', })
      .then(function (response) {
        return response.json();
      })
      .then(function (myJson) {
        this.setState({
          mydata: myJson.list,
          userName: myJson.username,
        });
      }.bind(this)
      )
      .catch(function (error) {
        console.log(error);
      });
  };

  componentWillMount() {
    this.getData();
  };



  render() {

    const data = this.state.mydata.map(function (ele, index) {
      return ele.title;
    });
    const { editorState } = this.state;

    return (

      <div>
        <Search
          className="searchBar"
          placeholder="input search text"
          onSearch={this.onSearch.bind(this)}
          style={{ width: 400 }}
        />
        <Tag>{this.state.userName}</Tag>
        <Button className="userLogin" type="primary" onClick={this.userLogin} >点击登录</Button>
        <Modal
          title="Log in"
          visible={this.state.loginVisible}
          footer={null}
          onCancel={this.loginHandleCancel}
          width={350}
        >
          <WrappedNormalLoginForm hideLogin={this.hideLogin} />

        </Modal>
        <br /><br />
        <h3 style={{ margin: '16px 0' }}>Large Size</h3>
        <List
          size="large"
          header={<div>Header</div>}
          footer={<div>Footer</div>}
          bordered
          dataSource={data}
          renderItem={(item, idx) => {
            return (
              <List.Item actions={[
                <a onClick={this.editList.bind(this, idx)}>edit</a>,
                <Popconfirm title="Are you sure delete this task?" onConfirm={this.confirm.bind(this, idx)} onCancel={this.cancel} okText="Yes" cancelText="No">
                  <a href="#">Delete</a>
                </Popconfirm>
              ]}>
                <Skeleton title={false} active loading={false}>
                  <List.Item.Meta
                    title={<a href="https://ant.design">{item}</a>}
                    description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                  />
                  <div>content</div>
                </Skeleton>
              </List.Item>)
          }
          }
        />
        <div>
          <Button type="primary" onClick={this.showAddModal}>Add</Button>
          <Modal
            title="Basic Modal"
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
          >
            <Input placeholder="Basic usage" onChange={this.catchData} value={this.state.inputValue} />
            <Editor
              editorState={editorState}
              wrapperClassName="demo-wrapper"
              editorClassName="demo-editor"
              onEditorStateChange={this.onEditorStateChange}
            />
          </Modal>
        </div>


      </div>
    );
  }
}

export default App;

