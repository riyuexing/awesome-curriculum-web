import { Avatar, Button, Divider, Icon, Input, Popover } from 'antd';
import React from 'react';
import io from 'socket.io-client';
import { getAvatar, getName, getSchool, getToken } from '../../utils/auth';
import './Chat.css';

let socket: any = '';

interface IState {
  avatar: string;
  name: string;
  chooseCourse: string;
  chatContent: any;
  messageInput: string;
  socket: any;
}

interface IProps {
  courseList: any[];
}

class Chat extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      avatar: getAvatar() as string,
      name: getName() as string,
      chooseCourse: '数据结构',
      chatContent: [],
      messageInput: '',
      socket: '',
    };
  }

  /**
   * handleCourseClick
   */
  public handleCourseClick = (name: any) => {
    this.props.courseList.forEach((e) => (e.choose = false));
    const index = this.props.courseList.findIndex((e) => e.name === name);
    this.props.courseList[index].choose = true;
    this.setState({
      chooseCourse: name,
    });
  }

  /**
   * messageInputChange
   */
  public messageInputChange = (e: any) => {
    this.setState({
      messageInput: e.target.value,
    });
  }

  /**
   * sendMessage
   */
  public sendMessage = () => {
    this.state.socket.emit('send message', {
      from: getToken(),
      content: this.state.messageInput,
      to: this.props.courseList.filter((x: any) => x.name === this.state.chooseCourse)[0],
      school: getSchool(),
    });
    const res = this.state.chatContent.find((item: any) => item.courseName === this.state.chooseCourse);
    if (res) {
      res.data.push({
        self: true,
        content: this.state.messageInput,
        from: {
          avatar: getAvatar(),
          username: getName(),
        },
      });
    } else {
      const chatContent = this.state.chatContent;
      chatContent.push({
        courseName: this.state.chooseCourse,
        data: [{
          self: true,
          content: this.state.messageInput,
          from: {
            avatar: getAvatar(),
            username: getName(),
          },
        }],
      });
      this.setState({
        chatContent,
      });
    }
    this.setState({
      messageInput: '',
    });
  }

  /**
   * insertMessage
   */
  public insertMessage(name: string, content: string, from: any) {
    const chatContent = this.state.chatContent;
    const res = chatContent.find((item: any) => item.courseName === name);
    console.log(from);
    if (res) {
      res.data.push({
        self: false,
        content,
        from,
      });
    } else {
      chatContent.push({
        courseName: name,
        data: [{
          self: false,
          content,
          from,
        }],
      });
    }
    this.setState({
      chatContent,
    });
  }
  public componentDidMount = () => {
    // 建立websocket连接
    socket = io('https://coursehelper.online:5000');
    socket.on('open', () => {
      console.log('客户端已连接');
      socket.emit('binding', {
        from: getToken(),
        groups: this.props.courseList,
        school: getSchool(),
      });
      socket.on('broadcast message', (data: any) => {
        console.log(data.content);
        this.insertMessage(data.courseName, data.content, data.from);
      });
    });
    this.setState({
      socket,
    });
    this.handleCourseClick(this.props.courseList[0].name);
  }

  public render() {
    return (
      <div className='chat-container'>
        <div className='chat-container__user'>
          <Avatar
            size={40}
            src={this.state.avatar}
            className='chat-container__user-avatar'
          />
          <span className='chat-container__user-name'>{this.state.name}</span>
          <Popover content='与你的学校、课程各项信息相同的用户会进入同一个群聊' placement='right'>
            <Icon
              type='question-circle'
              className='chat-container__user-icon'
            />
          </Popover>
        </div>
        <div className='chat-container__chat-list'>
          {this.props.courseList.map((course) => {
            return (
              <div
                className='course-item'
                key={course.name}
                style={{
                  backgroundColor: course.choose ? '#3D9F92' : '#4AA89B',
                }}
                onClick={this.handleCourseClick.bind(this, course.name)}
              >
                <Avatar size='large' className='course-item__avatar'>
                  {course.name[0]}
                </Avatar>
                <span className='course-item__name'>{course.name}</span>
              </div>
            );
          })}
        </div>
        <div className='chat-container__content'>
          <div className='content__header'>
            <span>{this.state.chooseCourse}</span>
          </div>
          <Divider />
          <div className='content__chat'>
            {this.state.chatContent.find(
              (item: any) => item.courseName === this.state.chooseCourse,
            ) ? (
              this.state.chatContent
                .find((item: any) => item.courseName === this.state.chooseCourse)
                .data.map((item: any, index: number) => {
                  return !item.self ? <div key={index} className='message--2l0Oz '>
                  <img
                    className='avatar--2ifA1'
                    src={item.from.avatar}
                    alt=''
                    style={{width: '44px', height: '44px', borderRadius: '22px'}}
                  />
                  <div className='right--39-4H'>
                    <div className='nicknameTimeBlock--2H_Hk'>
                      <span className='nickname--3Gfts'>{item.from.username}</span>
                      {/* <span className='time--3uGVq'>19:40</span> */}
                    </div>
                    <div className='contentButtonBlock--3wqjA'>
                      <div className='content--2PkJk'>
                        <div className='textMessage--371Pk'>{item.content}</div>
                      </div>
                    </div>
                    <div className='arrow--1BPRE'/>
                  </div>
                </div> : <div
                  key={index}
                  className='message--2l0Oz'
                  style={{marginLeft: '54px', marginRight: '10px', justifyContent: 'flex-end'}}>
                  <div className='right--39-4H'>
                    <div className='nicknameTimeBlock--2H_Hk'>
                      <span className='nickname--3Gfts'>{item.from.username}</span>
                      {/* <span className='time--3uGVq'>19:40</span> */}
                    </div>
                    <div className='contentButtonBlock--3wqjA' style={{marginRight: '10px'}}>
                      <div className='content--2PkJk'>
                        <div className='textMessage--371Pk'>{item.content}</div>
                      </div>
                    </div>
                    <div className='arrow--1BPRE' style={{right: '54px', left: 'unset'}}/>
                  </div>
                  <img
                    className='avatar--2ifA1'
                    src={item.from.avatar}
                    alt=''
                    style={{width: '44px', height: '44px', borderRadius: '22px'}}
                  />
                </div>
                ;
                })
            ) : (
              <div />
            )}
          </div>
          <div className='content__input'>
            <Icon type='smile' className='content__input__emoji' />
            <Input className='content__input__edit' value={this.state.messageInput} onChange={this.messageInputChange}/>
            <Button onClick={this.sendMessage}>发送</Button>
          </div>
        </div>
      </div>
    );
  }
}

export default Chat;
