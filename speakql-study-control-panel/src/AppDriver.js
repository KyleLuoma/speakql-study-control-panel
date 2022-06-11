import React from 'react';
import getAttemptSubmissions from './ApiCalls/GetAttemptSubmissions';
import getAllCommittedAttempts from './ApiCalls/GetAllComittedAttempts';
import saveAttempt from './ApiCalls/SaveAttempt';
import revertAttempt from './ApiCalls/RevertAttempt';
import getParticipantUsernames from './ApiCalls/GetParticipantUsernames';
import getParticipantIdFromUsername from './ApiCalls/GetParticipantIdFromUsername';
import getSequenceIds from './ApiCalls/GetSequenceIds';

export default class AppDriver extends React.Component {

    constructor(props) {
        super(props)
        this.state = ({
            attempt_submissions: {},
            committed_attempts: {},
            submission_selected: -1,
            commit_selected: -1,
            participant_id: -1,
            username: '',
            show_session_creation: true,
            selected_sequence: ''
        })

        this.handleGetSubmissions = this.handleGetSubmissions.bind(this);
        this.handleSubmissionTableRowSelected = this.handleSubmissionTableRowSelected.bind(this);
        this.handleGetCommittedAttempts = this.handleGetCommittedAttempts.bind(this);
        this.handleSaveCorrectAttempt = this.handleSaveCorrectAttempt.bind(this);
        this.handleSaveIncorrectAttempt = this.handleSaveIncorrectAttempt.bind(this);
        this.handleRevertAttempt = this.handleRevertAttempt.bind(this);
        this.handleParticipantSelection = this.handleParticipantSelection.bind(this);
        this.handleSequenceSelection = this.handleSequenceSelection.bind(this);
        this.handleSessionCreation = this.handleSessionCreation.bind(this);

    }

    async componentDidMount() {

        const usernameUpdate = this.state.usernames || await getParticipantUsernames()
        const sequenceIdUpdate = this.state.sequence_ids || await getSequenceIds()

        this.setState({
            usernames: usernameUpdate,
            sequence_ids: sequenceIdUpdate
        });
        // console.log(sequenceIdUpdate);
        // console.log("USERNAMES:", this.state.usernames)
    }

    async handleGetSubmissions() {
        this.setState({
            attempt_submissions: await getAttemptSubmissions(this.state.participant_id)
        })
    }

    async handleGetCommittedAttempts() {
        this.setState({
            committed_attempts: await getAllCommittedAttempts(this.state.participant_id)
        })
    }

    async handleSaveCorrectAttempt() {
        await saveAttempt(this.state.submission_selected, true);
        await this.handleGetSubmissions();
        await this.handleGetCommittedAttempts();
    }

    async handleSaveIncorrectAttempt() {
        await saveAttempt(this.state.submission_selected, false);
        await this.handleGetSubmissions();
        await this.handleGetCommittedAttempts();
    }

    async handleRevertAttempt() {
        await revertAttempt(this.state.commit_selected);
        await this.handleGetSubmissions();
        await this.handleGetCommittedAttempts();
    }

    handleSubmissionTableRowSelected(idAttemptSubmissions) {
        console.log("row clicked", idAttemptSubmissions);
        this.setState({submission_selected: idAttemptSubmissions});
    }

    async handleParticipantSelection(e) {
        // console.log(e.target.value)
        const selectedUsername = e.target.value;
        const response = await getParticipantIdFromUsername(selectedUsername);
        console.log(selectedUsername, response['idparticipant']);
        this.setState({
            participant_id: response['idparticipant'],
            username: response['username']
        });
    }

    async handleSequenceSelection(e) {
        const selectedSequence = e.target.value;
        this.setState({
            selected_sequence: selectedSequence
        });
    }

    async handleSessionCreation() {
        return;
    }


    renderSubmissionsTable() {

        const keys = Object.keys(this.state.attempt_submissions);
        if (keys[0] !== undefined && keys[0] !== 'msg') {
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
        if (keys[0] !== undefined && keys[0] !== 'msg') {
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

    renderUsernameSelection() {
        if(this.state.usernames) {
            return (
                <div>
                    <label>Select Participant: </label>
                    <select 
                        name="participants" id="participants" 
                        onChange={this.handleParticipantSelection}
                    >
                        {
                            this.state.usernames.map(
                                username => <option value = {username}>{username}</option>
                                )
                        }
                    </select>
                </div>
            )
        }
    }

    renderSessionCreation(showSessionCreation) {
        if(this.state.sequence_ids && showSessionCreation) {
            return (
                <div>
                    <label>Select Query Sequence: </label>
                    <select 
                        name="sequences" id="sequences" 
                        //onChange={}
                    >
                        {
                            this.state.sequence_ids.map(
                                sequenceId => <option value = {sequenceId}>{sequenceId}</option>
                                )
                        }
                    </select>
                    <div><button>Create Session</button></div>
                </div>
            )
        }
    }

    render() {
        return (
            <div>
                {this.renderUsernameSelection()}
                {this.renderSessionCreation(true)}
                <h3>Current Submissions:</h3>
                {this.renderSubmissionsTable()}
                <button onClick={this.handleGetSubmissions}>Get Submissions</button>
                <button onClick={this.handleSaveCorrectAttempt}>Save as Correct</button>
                <button onClick={this.handleSaveIncorrectAttempt}>Save as Incorrect</button>
                <h3>Committed Attempts:</h3>
                {this.renderCommittedAttemptsTable()}
                <button onClick={this.handleGetCommittedAttempts}>Get Committed Attempts</button>
                <button onClick={this.handleRevertAttempt}>Revert Selected</button>
            </div>
        )
    }

}