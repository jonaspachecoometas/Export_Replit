<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ifood_configs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_id')->constrained('empresas');
            $table->string('clientId', 100);
            $table->string('clientSecret', 200);
            $table->enum('grantType', ['authorization_code', 'client_credentials', 'refresh_token']);
            $table->string('userCode', 10);
            $table->string('authorizationCode', 10);
            $table->string('authorizationCodeVerifier', 150);
            $table->string('verificationUrlComplete', 255);

            $table->text('accessToken');
            $table->text('refreshToken');
            $table->string('merchantId', 40)->nullable();
            $table->string('merchantUUID', 40)->nullable();
            $table->string('catalogId', 100);

            // alter table ifood_configs add column merchantUUID varchar(40) default null;

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ifood_configs');
    }
};
