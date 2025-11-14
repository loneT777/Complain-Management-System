<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'employee_id',
        'organization_id',
        'department_id',
        'designation_id',
        'service_id',
        'awarding_agency',
        'countries_visited',
        'purpose_of_travel',
        'nature_of_travel',
        'departure_date',
        'arrival_date',
        'previous_report_submitted',
        'application_type',
        'loan_particulars',
        'commencement_date',
        'completion_date',
        'foreign_contact_data',
        'coverup_duty'
    ];

    protected $casts = [
        'departure_date' => 'date',
        'arrival_date' => 'date',
        'commencement_date' => 'date',
        'completion_date' => 'date',
        'previous_report_submitted' => 'boolean',
        'nature_of_travel' => 'string'
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(LoginSession::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'department_id');
    }

    /**
     * Get the statuses associated with the application.
     */
    public function statuses(): BelongsToMany
    {
        return $this->belongsToMany(Status::class, 'application_statuses', 'application_id', 'status_id')
            ->withPivot('session_id', 'remark', 'created_date');
    }

    // Many-to-many relationship with expense types
    public function expenseTypes(): BelongsToMany
    {
        return $this->belongsToMany(
            ExpenseType::class, 
            'application_expenses_met', 
            'application_id', 
            'expenses_type_id'
        );
    }

    // One-to-many relationship with GOSL funds
    public function goslFunds(): HasMany
    {
        return $this->hasMany(ApplicationGoslFund::class);
    }

    // One-to-many relationship with TravellingHistory
    public function travellingHistories(): HasMany
    {
        return $this->hasMany(TravellingHistory::class);
    }

    /**
     * Get the files associated with the application.
     */
    public function files()
    {
        return $this->hasMany(ApplicationFile::class, 'application_id');
    }

    // Helper method to sync expense types
    public function syncExpenseTypes(array $expenseTypeIds)
    {
        $this->expenseTypes()->sync($expenseTypeIds);
    }

    // Helper method to sync GOSL funds with amounts
    public function syncGoslFunds(array $goslFundsData)
    {
        // Delete existing GOSL funds for this application
        $this->goslFunds()->delete();

        // Create new GOSL fund records
        foreach ($goslFundsData as $fundData) {
            if (isset($fundData['gosl_fund_type_id']) && isset($fundData['amount']) && $fundData['amount'] > 0) {
                $this->goslFunds()->create([
                    'gosl_fund_type_id' => $fundData['gosl_fund_type_id'],
                    'amount' => $fundData['amount']
                ]);
            }
        }
    }

    // Helper method to get selected expense type IDs
    public function getSelectedExpenseTypeIds()
    {
        return $this->expenseTypes->pluck('id')->toArray();
    }

    // Helper method to check if an expense type is selected
    public function hasExpenseType($expenseTypeId)
    {
        return $this->expenseTypes->contains('id', $expenseTypeId);
    }

    // Helper method to get GOSL funds as associative array for frontend
    public function getGoslFundsArray()
    {
        $result = [];
        foreach ($this->goslFunds as $fund) {
            $result[] = [
                'gosl_fund_type_id' => $fund->gosl_fund_type_id,
                'amount' => $fund->amount
            ];
        }
        return $result;
    }
}

// ApplicationGoslFund Model (create this file separately)
class ApplicationGoslFund extends Model
{
    use HasFactory;

    protected $table = 'application_gosl_funds';
    
    public $timestamps = false; // Since your migration doesn't include timestamps

    protected $fillable = [
        'application_id',
        'gosl_fund_type_id',
        'amount'
    ];

    protected $casts = [
        'amount' => 'decimal:2'
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function goslFundType(): BelongsTo
    {
        return $this->belongsTo(GoslFundType::class);
    }
}

// GoslFundType Model (create this file separately if it doesn't exist)
class GoslFundType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description'
    ];

    public function applicationGoslFunds(): HasMany
    {
        return $this->hasMany(ApplicationGoslFund::class);
    }
}

// TravellingHistory Model (create this file separately)
class TravellingHistory extends Model
{
    use HasFactory;

    protected $table = 'travelling_histories';
    public $timestamps = false;

    protected $fillable = [
        'application_id',
        'year',
        'purpose_of_travel',
        'travelling_start_date',
        'travelling_end_date',
        'country'
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}