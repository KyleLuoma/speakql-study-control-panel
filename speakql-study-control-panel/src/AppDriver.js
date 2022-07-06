import React from 'react';
import getAttemptSubmissions from './ApiCalls/GetAttemptSubmissions';
import getAllCommittedAttempts from './ApiCalls/GetAllComittedAttempts';
import saveAttempt from './ApiCalls/SaveAttempt';
import revertAttempt from './ApiCalls/RevertAttempt';
import getParticipantUsernames from './ApiCalls/GetParticipantUsernames';
import getParticipantIdFromUsername from './ApiCalls/GetParticipantIdFromUsername';
import getSequenceIds from './ApiCalls/GetSequenceIds';
import getParticipantSessions from './ApiCalls/GetParticipantSessions';
import registerParticipantSession from './ApiCalls/RegisterParticipantSession';
import getNextPrompt from './ApiCalls/GetNextPrompt';
import getQueryEvalData from './ApiCalls/GetQueryEvalData';

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
            show_session_creation: false,
            selected_sequence: '',
            participant_sessions: {},
            selected_session: -1,
            current_query_prompt: '',
            current_query_id: -1,
            current_language: '',
            current_step: -1,
            query_eval_data: {},
            query_eval_checkbox_checked: {}
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
        this.handleSessionSelection = this.handleSessionSelection.bind(this);
        this.handleGetQueryPrompt = this.handleGetQueryPrompt.bind(this);
        this.toggleShowSessionCreation = this.toggleShowSessionCreation.bind(this);
        this.toggleCheckedState = this.toggleCheckedState.bind(this);
    }

    async componentDidMount() {

        const usernameUpdate = this.state.usernames || await getParticipantUsernames()

        if(! usernameUpdate.hasOwnProperty('msg')) {
            this.setState({usernames: usernameUpdate});
        }

        const sequenceIdUpdate = this.state.sequence_ids || await getSequenceIds()

        if(! sequenceIdUpdate.hasOwnProperty('msg')) {
            this.setState({sequence_ids: sequenceIdUpdate});
        }

        // console.log(sequenceIdUpdate);
        // console.log("USERNAMES:", this.state.usernames)
    }

    toggleShowSessionCreation() {
        if(this.state.show_session_creation) {
            this.setState({show_session_creation: false})
        } else {
            this.setState({show_session_creation: true})
        }
    }

    async handleGetSubmissions() {
        this.setState({
            attempt_submissions: await getAttemptSubmissions(
                this.state.participant_id,
                this.state.selected_session
                )
        })
    }

    async handleGetCommittedAttempts() {
        this.setState({
            committed_attempts: await getAllCommittedAttempts(
                this.state.participant_id,
                this.state.selected_session
                )
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

    async handleGetQueryPrompt() {
        var promptJson = await getNextPrompt(this.state.participant_id);
        await this.setState({
            current_query_prompt: promptJson['prompt'],
            current_query_id: promptJson['idquery'],
            current_language: promptJson['language'],
            current_step: promptJson['step']
        })
        var queryJson = await getQueryEvalData(promptJson['idquery']);
        var example = queryJson['sql_example'];
        if(promptJson['language'] === 'speakql') {
            example = queryJson['speakql_example_1']
        }

        var checkboxStatuses = this.state.query_eval_checkbox_checked || {};
        console.log(Object.keys(checkboxStatuses));
        for(const status of Object.keys(checkboxStatuses) || []) {
            checkboxStatuses[status] = false;
        }
        console.log("checkboxStatuses:", checkboxStatuses);
        this.setState({query_eval_checkbox_checked : checkboxStatuses});

        this.setState({
            query_eval_data : {
                example: example,
                functions: queryJson['functions'],
                joins: queryJson['joins'],
                modifiers: queryJson['modifiers'],
                selections: queryJson['selection'],
                projections: queryJson['projections'],
                tables: queryJson['tables']
            }
        })

        console.log(queryJson);
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

        const sessions = await getParticipantSessions(response['idparticipant']);
        console.log(sessions)

        this.setState({
            participant_id: response['idparticipant'],
            username: response['username'],
            participant_sessions: sessions
        });
    }

    async handleSequenceSelection(e) {
        const selectedSequence = e.target.value;
        console.log("selectedSequence:", selectedSequence);
        this.setState({
            selected_sequence: selectedSequence
        });
        console.log("State selected_sequence:", this.state.selected_sequence);
    }

    async handleSessionCreation() {
        if(
            this.state.participant_id !== undefined 
            && this.state.participant_id > 0
            && this.state.selected_sequence !== undefined
            ){
                console.log("SELECTED_SEQUENCE", this.state.selected_sequence);
                await registerParticipantSession(
                    this.state.participant_id,
                    this.state.selected_sequence
                );
                this.toggleShowSessionCreation();
        }
    }

    async handleSessionSelection(e) {
        const selectedSession = e.target.value;
        this.setState({
            selected_session: selectedSession
        });
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
        if(this.state.usernames !== undefined) {
            return (
                <div>
                    <label>Select Participant: </label>
                    <select 
                        name="participants" id="participants" 
                        onChange={this.handleParticipantSelection}
                    >
                        <option>Make a Selection</option>
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

    renderSessionSelection() {
        if(
            ! this.state.participant_sessions.hasOwnProperty('msg') && Object.keys(this.state.participant_sessions).length > 0
            ) {
                const keys = Object.keys(this.state.participant_sessions);
                console.log(this.state.participant_sessions);
                return (
                    <div>
                        <label>Select Participant Session</label>
                        <select
                            name="sessions" id = "sessions"
                            onChange={this.handleSessionSelection}
                        >
                            <option value="await_selection">Make a selection</option>
                            {
                                keys.map(
                                    key => <option value = {
                                        this.state.participant_sessions[key]['idsession']
                                    }> 
                                    {this.state.participant_sessions[key]['idsession']} 
                                    -
                                    {this.state.participant_sessions[key]['idsequence']}
                                    </option>
                                )
                            }
                        </select>
                    </div>
                )
            } else {
                return <div>
                        <div>Participant does not appear to have any registered sessions.</div>
                    </div>
            }
    }

    toggleCheckedState(obj) {
        console.log("Checkbox param passed:", obj.target.name);
        var checkedState = this.state.query_eval_checkbox_checked;
        var isChecked = checkedState[obj.target.name] || false;
        checkedState[obj.target.name] = ! isChecked;
        this.setState({query_eval_checkbox_checked : checkedState});
        console.log(this.state.query_eval_checkbox_checked);
    }

    renderQueryPrompt() {
        if(this.state.participant_id > 0 && this.state.selected_session > 0) {
            let tableText = this.state.query_eval_data['tables'] || '';
            let tableList = tableText.split(',');
            let columnText = this.state.query_eval_data['projections'] || '';
            let columnList = columnText.split(',');
            let functionText = this.state.query_eval_data['functions'] || '';
            let functionList = functionText.split(',');
            let joinText = this.state.query_eval_data['joins'] || '';
            let joinList = joinText.split(',');
            let modifierText = this.state.query_eval_data['modifiers'] || '';
            let modifierList = modifierText.split(',');
            let selectionText = this.state.query_eval_data['selections'] || '';
            let selectionList = selectionText.split(',');
            return (
                <div class="grading-form">
                    {/* <button onClick={this.handleGetQueryPrompt}>Get Prompt</button> */}
                    <form class="grading-form">
                        <table class="grading-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th class="content-cell">Input</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td class="label-cell">Prompt:</td><td class="content-cell">{this.state.current_query_prompt}</td></tr>
                                <tr><td class="label-cell">Language:</td><td class="content-cell">{this.state.current_language}</td></tr>
                                <tr><td class="label-cell">Step:</td><td class="content-cell">{this.state.current_step}</td></tr>
                                <tr><td class="label-cell">Example:</td><td class="content-cell">{this.state.query_eval_data['example']}</td></tr>
                                <tr>
                                    <td class="label-cell">Tables:</td>
                                    <td class="content-cell">{tableList.map((
                                        table => <>
                                        <input type="checkbox" name={"table_" + table} checked={this.state.query_eval_checkbox_checked["table_" + table] || false} onChange={this.toggleCheckedState}></input>
                                        <label for={"table_" + table}>{table}</label>
                                        </>
                                    ))}</td>
                                </tr>
                                    <td class="label-cell">Columns:</td>
                                    <td class="content-cell">{columnList.map((
                                        column => <>
                                        <input type="checkbox" name={"column_" + column} checked={this.state.query_eval_checkbox_checked["column_" + column] || false} onChange={this.toggleCheckedState}></input>
                                        <label for={"column_" + column}>{column}</label>
                                        </>
                                    ))}</td>
                                    <tr>
                                </tr>
                                <tr>
                                    <td class="label-cell">Functions:</td>
                                    <td class="content-cell">{functionList.map((
                                        funct => <>
                                        <input type="checkbox" name={"funct_" + funct} checked={this.state.query_eval_checkbox_checked["funct_" + funct] || false} onChange={this.toggleCheckedState}></input>
                                        <label for={"funct_" + funct}>{funct}</label>
                                        </>
                                    ))}</td>
                                </tr>
                                <tr>
                                    <td class="label-cell">Joins:</td>
                                    <td class="content-cell">{joinList.map((
                                        join => <>
                                        <input type="checkbox" name={"join_" + join} checked={this.state.query_eval_checkbox_checked["join_" + join] || false} onChange={this.toggleCheckedState}></input>
                                        <label for={"join_" + join}>{join}</label>
                                        </>
                                    ))}</td>
                                </tr>
                                <tr>
                                    <td class="label-cell">Modifiers:</td>
                                    <td class="content-cell">{modifierList.map((
                                        modifier => <>
                                        <input type="checkbox" name={"modifier_" + modifier} checked={this.state.query_eval_checkbox_checked["modifier_" + modifier] || false} onChange={this.toggleCheckedState}></input>
                                        <label for={"modifier_" + modifier}>{modifier}</label>
                                        </>
                                    ))}</td>
                                </tr>
                                <tr>
                                    <td class="label-cell">Selections:</td>
                                    <td class="content-cell">{selectionList.map((
                                        selection => <>
                                        <input type="checkbox" name={"selection_" + selection} checked={this.state.query_eval_checkbox_checked["selection_" + selection] || false} onChange={this.toggleCheckedState}></input>
                                        <label for={"selection_" + selection}>{selection}</label>
                                        </>
                                    ))}</td>
                                </tr>
                                <tr>
                                    <td class="label-cell">Syntax Errors:</td>
                                    <td class="content-cell">
                                        <br></br>
                                        <input type="checkbox" name="incorrectKeyword" checked={this.state.query_eval_checkbox_checked["incorrectKeyword"] || false} onChange={this.toggleCheckedState}></input>
                                        <label for="incorrectKeyword">Incorrect Keyword</label>

                                        <br></br>
                                        <input type="checkbox" name="incorrectExpressionOrder" checked={this.state.query_eval_checkbox_checked["incorrectExpressionOrder"] || false} onChange={this.toggleCheckedState}></input>
                                        <label for="incorrectExpressionOrder">Incorrect Expression Order</label>

                                        <br></br>
                                        <input type="checkbox" name="incorrectJoinSyntax" checked={this.state.query_eval_checkbox_checked["incorrectJoinSyntax"] || false} onChange={this.toggleCheckedState}></input>
                                        <label for="incorrectJoinSyntax">Incorrect Join Syntax</label>

                                        <br></br>
                                        <input type="checkbox" name="incorrectFunctionSyntax" checked={this.state.query_eval_checkbox_checked["incorrectFunctionSyntax"] || false} onChange={this.toggleCheckedState}></input>
                                        <label for="incorrectFunctionSyntax">Incorrect Function Syntax</label>

                                        <br></br>
                                        <label for="syntaxErrors">Other Syntax Errors </label>
                                        <input type="text" name="syntaxErrors"></input>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label-cell">Symbol Errors</td>
                                    <td class="content-cell">
                                        <br></br>
                                        <input type="checkbox" name="missingComma" checked={this.state.query_eval_checkbox_checked["missingComma"] || false} onChange={this.toggleCheckedState}></input>
                                        <label for="missingComma">Missing Comma</label>

                                        <br></br>
                                        <input type="checkbox" name="missingParen" checked={this.state.query_eval_checkbox_checked["missingParen"] || false} onChange={this.toggleCheckedState}></input>
                                        <label for="missingParen">Missing Parenthesis</label>

                                        <br></br>
                                        <input type="checkbox" name="missingQuote" checked={this.state.query_eval_checkbox_checked["missingQuote"] || false} onChange={this.toggleCheckedState}></input>
                                        <label for="missingQuote">Missing Quote</label>

                                        <br></br>
                                        <input type="checkbox" name="missingOperator" checked={this.state.query_eval_checkbox_checked["missingOperator"] || false} onChange={this.toggleCheckedState}></input>
                                        <label for="missingOperator">Missing Operator</label>

                                        <br></br>
                                        <label for="symbolErrors">Other Symbol Errors </label>
                                        <input type="text" name="symbolErrors"></input>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </form>
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
                        onChange={this.handleSequenceSelection}
                    >
                        <option>Make a Selection</option>
                        {
                            this.state.sequence_ids.map(
                                sequenceId => <option value = {sequenceId}>{sequenceId}</option>
                                )
                        }
                    </select>
                    <div>
                        <button onClick={this.handleSessionCreation}>Create Session</button>
                        <button onClick={this.toggleShowSessionCreation}>Cancel</button>                        
                    </div>
                </div>
            )
        } else {
            return (
                <button onClick={this.toggleShowSessionCreation}>Register New Session</button>
            )
        }
    }

    render() {
        return (
            <div>
                {this.renderUsernameSelection()}
                {this.renderSessionSelection()}
                {this.renderSessionCreation(this.state.show_session_creation)}
                <h3>Current Query Prompt:</h3>
                <button onClick={this.handleGetQueryPrompt}>Get Prompt</button>
                {this.renderQueryPrompt()}
                <h3>Current Submissions for {this.state.username}</h3>
                {this.renderSubmissionsTable()}
                <button onClick={this.handleGetSubmissions}>Get Submissions</button>
                <button onClick={this.handleSaveCorrectAttempt}>Save as Correct</button>
                <button onClick={this.handleSaveIncorrectAttempt}>Save as Incorrect</button>
                <h3>Committed Attempts for {this.state.username}:</h3>
                {this.renderCommittedAttemptsTable()}
                <button onClick={this.handleGetCommittedAttempts}>Get Committed Attempts</button>
                <button onClick={this.handleRevertAttempt}>Revert Selected</button>
            </div>
        )
    }

}