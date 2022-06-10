import React from 'react';
import getAttemptSubmissions from './ApiCalls/GetAttemptSubmissions';
import getAllCommittedAttempts from './ApiCalls/GetAllComittedAttempts';
import saveAttempt from './ApiCalls/SaveAttempt';

export default class AppDriver extends React.Component {

    constructor(props) {
        super(props)
        this.state = ({
            attempt_submissions: {},
            committed_attempts: {},
            submission_selected: -1,
            commit_selected: -1
        })

        this.handleGetSubmissions = this.handleGetSubmissions.bind(this);
        this.handleSubmissionTableRowSelected = this.handleSubmissionTableRowSelected.bind(this);
        this.handleGetCommittedAttempts = this.handleGetCommittedAttempts.bind(this);
        this.handleSaveCorrectAttempt = this.handleSaveCorrectAttempt.bind(this);
        this.handleSaveIncorrectAttempt = this.handleSaveIncorrectAttempt.bind(this);

    }

    async handleGetSubmissions() {
        this.setState({
            attempt_submissions: await getAttemptSubmissions(25)
        })
    }

    async handleGetCommittedAttempts() {
        this.setState({
            committed_attempts: await getAllCommittedAttempts(25)
        })
    }

    async handleSaveCorrectAttempt() {
        await saveAttempt(this.state.submission_selected, true);
        await this.handleGetSubmissions();
        await this.handleGetCommittedAttempts();
    }

    async handleSaveIncorrectAttempt() {
        await saveAttempt(this.state.submission_selected, false);
    }

    handleSubmissionTableRowSelected(idAttemptSubmissions) {
        console.log("row clicked", idAttemptSubmissions);
        this.setState({submission_selected: idAttemptSubmissions});
    }

    renderSubmissionsTable() {

        const keys = Object.keys(this.state.attempt_submissions);
        if (keys[0] !== undefined && keys[0] != 'msg') {
            // console.log('keys[0]', keys[0]);
            const columns = Object.keys(this.state.attempt_submissions[keys[0]]);
            // console.log(columns);
                        
            return (
                <table>
                    <thead>
                        <tr>
                            <th>idattemptsubmissions</th>
                            {columns.map(head => <th>{head}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        { keys.map(
                            (key => <tr 
                                        onClick={() => this.handleSubmissionTableRowSelected(key)}
                                        className={
                                            this.state.submission_selected === key ? 'table-row-selected' : 'table-row'
                                        }
                                    >
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


    handleComittedAttemptTableRowSelected(idAttemptSubmissions) {
        this.setState({commit_selected: idAttemptSubmissions});
    }


    renderCommittedAttemptsTable() {

        const keys = Object.keys(this.state.committed_attempts);
        if (keys[0] !== undefined) {
            // console.log('keys[0]', keys[0]);
            const columns = Object.keys(this.state.committed_attempts[keys[0]]);
            // console.log(columns);
                        
            return (
                <table>
                    <thead>
                        <tr>
                            <th>idattemptsubmissions</th>
                            {columns.map(head => <th>{head}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        { keys.map(
                            (key => <tr 
                                        onClick={() => this.handleComittedAttemptTableRowSelected(key)}
                                        className={
                                            this.state.commit_selected === key ? 'table-row-selected' : 'table-row'
                                        }
                                    >
                                <td>{key}</td>
                                {
                                    columns.map(column => <td>{
                                        this.state.committed_attempts[key][column]
                                        }</td>)
                                }
                            </tr>)
                        )}
                    </tbody>                    
                </table>
            )

        } else {
            return (
                <h3>No Participant Committed Attempts Loaded</h3>
            )
        }
    }

    render() {
        return (
            <div>
                <h3>Current Submissions:</h3>
                {this.renderSubmissionsTable()}
                <button onClick={this.handleGetSubmissions}>Get Submissions</button>
                <button onClick={this.handleSaveCorrectAttempt}>Save as Correct</button>
                <button onClick={this.handleSaveIncorrectAttempt}>Save as Incorrect</button>
                <h3>Committed Attempts:</h3>
                {this.renderCommittedAttemptsTable()}
                <button onClick={this.handleGetCommittedAttempts}>Get Committed Attempts</button>
            </div>
        )
    }

}