import React from 'react';
import getAttemptSubmissions from './ApiCalls/GetAttemptSubmissions';

export default class AppDriver extends React.Component {

    constructor(props) {
        super(props)
        this.state = ({
            attempt_submissions: {}
        })

        this.handleGetSubmissions = this.handleGetSubmissions.bind(this);

    }

    async handleGetSubmissions() {
        this.setState({
            attempt_submissions: await getAttemptSubmissions(25)
        })
    }

    renderSubmissionsTable() {

        const keys = Object.keys(this.state.attempt_submissions);
        if (keys[0] !== undefined) {
            console.log('keys[0]', keys[0]);
            const columns = Object.keys(this.state.attempt_submissions[keys[1]]);
            console.log(columns);
                        
            return (
                <table>
                    <thead>
                        <tr>
                            <th>idattemptsubmissions</th>
                            {columns.map(head => <th>{head}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {keys.map(
                            (key => <tr>
                                <td>{key}</td>
                                {
                                    columns.map(column => <td>{
                                        this.state.attempt_submissions[key][column]
                                        }</td>)
                                }
                            </tr>)
                        )}
                    </tbody>                    
                </table>
            )

        } else {
            return (
                <h3>No Participant Submissions Loaded</h3>
            )
        }
    }

    render() {
        return (
            <div>
                <button onClick={this.handleGetSubmissions}>Get Submissions</button>
                {this.renderSubmissionsTable()}
            </div>
        )
    }

}