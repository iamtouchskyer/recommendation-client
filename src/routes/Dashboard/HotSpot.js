import React, { Component, PureComponent } from 'react';
import { connect } from 'dva';
import {
  Tabs,
  Row,
  Col,
  Card,
  Tooltip,
  DatePicker,
  Select,
  Cascader
} from 'antd';
import numeral from 'numeral';
import Authorized from '../../utils/Authorized';
import { Pie, WaterWave, Gauge, TagCloud, Bar } from '../../components/Charts';
import NumberInfo from '../../components/NumberInfo';
import CountDown from '../../components/CountDown';
import ActiveChart from '../../components/ActiveChart';
import HotSpotInvervalChart from '../../components/Charts/HotSpotIntervalChart/index';
import styles from './Analysis.less';
import { getTimeDistance } from '../../utils/utils';
import kindMetadata from '../../../metadata/kind';
import areaMetadata from '../../../metadata/area';
import filterMetadata from '../../../metadata/filter';
import TopWrapper from './Top/TopWrapper';

const { Secured } = Authorized;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const targetTime = new Date().getTime() + 3900000;
function handleChange(value) {
  console.log(`selected ${value}`);
}
// use permission as a parameter
const havePermissionAsync = new Promise((resolve) => {
  // Call resolve on behalf of passed
  setTimeout(() => resolve(), 1000);
});
@Secured(havePermissionAsync)
@connect(({ cibnHot, loading }) => ({
  cibnHot,
  loading: loading.effects['cibnHot/fetchFilter'],
}))
export default class HotSpot extends Component {
  state = {
    kind: 'movie',
    filter: {},
    location: null,
    rangePickerValue: getTimeDistance('thisYear'),
  };

  componentDidMount() {
    this.fetchFilter(this.state.kind);
  }

  fetchFilter(kind) {
    this.props.dispatch({
      type: 'cibnHot/fetchFilter',
      payload: {
        kind,
      },
    });
  }

  onChangeAreaId(areaId) {
    this.setState({ areaId });
  }

  onChangeKind(kind) {
    this.setState({ kind });
    this.fetchFilter(kind);
  }

  onChangeFilter(name, value) {
    const filter = (value === 'all')
      ? _.omit(this.state.filter, name)
      : _.defaults({
          [name]: value,
        }, this.state.filter);
    this.setState({ filter });
  }

  selectDate = (type) => {
    this.setState({
      rangePickerValue: getTimeDistance(type),
    });
  };

  isActive(type) {
    const { rangePickerValue } = this.state;
    const value = getTimeDistance(type);
    if (!rangePickerValue[0] || !rangePickerValue[1]) {
      return;
    }
    if (
      rangePickerValue[0].isSame(value[0], 'day') &&
      rangePickerValue[1].isSame(value[1], 'day')
    ) {
      return styles.currentDate;
    }
  }

  handleRangePickerChange = (rangePickerValue) => {
    this.setState({
      rangePickerValue,
    });
  };

  renderDatePicker = () => {
    const { rangePickerValue } = this.state;
    return (
      <div className={styles.salesExtraWrap}>
        <div className={styles.salesExtra}>
          <a className={this.isActive('week')} onClick={() => this.selectDate('week')}>
            本周
          </a>
          <a className={this.isActive('month')} onClick={() => this.selectDate('month')}>
            本月
          </a>
          <a className={this.isActive('year')} onClick={() => this.selectDate('thisYear')}>
            全年
          </a>
        </div>
        <RangePicker
          value={rangePickerValue}
          onChange={this.handleRangePickerChange}
          style={{ width: 256, textAlign: 'left' }}
        />
      </div>
    );
  };

  renderCardExtra() {
    return (
      <Row style={{ textAlign: 'left' }}>
        <Col xs={6}>
          <Cascader
            defaultValue={this.state.areaId}
            options={areaMetadata}
            onChange={(value) => { this.onChangeAreaId(value)}}
            showSearch
            placeholder="客户端省份"
          />
        </Col>
        <Col xs={18}>
          { this.renderDatePicker() }
        </Col>
      </Row>
    );
  }

  render() {
    const { cibnHot, loading } = this.props;
    const { filter, playCount } = cibnHot;

    if (filter) {
      return (
        <Card
          title="热门榜单"
          loading={loading}
          bordered={false}
          bodyStyle={{ padding: 0 }}
          style={{ marginTop: 24 }}
          extra={this.renderCardExtra()}
        >
          <div style={{ marginTop: 20, marginLeft: 30 }}>
            <Row gutter={12} type='flex' justify='space-between'>
              <Col span={6}>
                <label>
                  <Select defaultValue={this.state.kind} style={{ width: 120 }} onChange={(value) => { this.onChangeKind(value) }}>
                    {_.map(kindMetadata, (meta, kind) => {
                      return <Option value={kind} key={kind}>{meta.name}</Option>
                    })}
                  </Select>
                </label>
              </Col>
              <Col span={15}>
                <Row gutter={12}>
                  {_.map(filter, (options, name) => {
                    return (
                      <Col span={8} key={name}>
                        <label key={name}>
                          {filterMetadata[name].name}
                          <Select defaultValue="all" style={{ width: 120, marginLeft: 10 }} onChange={(value) => { this.onChangeFilter(name, value) }}>
                            <Option value="all">全部</Option>
                            {_.map(options, (option, index) => {
                              return <Option value={option} key={option}>{option}</Option>
                            })}
                          </Select>
                        </label>
                      </Col>
                    );
                  })}
                </Row>
              </Col>
            </Row>
          </div>
          {
            <TopWrapper
              payload={{
                kind: this.state.kind,
                language: this.state.filter.languages,
                category: this.state.filter.categories,
                area: this.state.filter.areas,
                areaId: _.last(this.state.areaId),
                startDate: this.state.rangePickerValue[0],
                endDate: this.state.rangePickerValue[1]
              }}
            />
          }
        </Card>
      );
    }
    return <Card loading={true} />;
  }
}
